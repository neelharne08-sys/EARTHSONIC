import ast
import unittest
from pathlib import Path

import integrate_public_home


class PublicHomeInstallerTests(unittest.TestCase):
    def make_fixture(self):
        source = Path(integrate_public_home.__file__).read_text(encoding='utf-8')
        tree = ast.parse(source)
        function = next(item for item in tree.body if isinstance(item, ast.FunctionDef) and item.name == 'build_changes')
        fixtures = {}
        path = None
        for statement in function.body:
            if not isinstance(statement, ast.Assign):
                continue
            target = statement.targets[0]
            if isinstance(target, ast.Name) and target.id == 'path':
                path = ast.literal_eval(statement.value)
                fixtures.setdefault(path, [])
            elif isinstance(target, ast.Name) and target.id == 's':
                call = statement.value
                if isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and call.func.id == 'replace_once':
                    old = ast.literal_eval(call.args[1])
                    fixtures[path].append(old)
        return {name: '\n\n===UNRELATED-CONTENT===\n\n'.join(anchors) for name, anchors in fixtures.items()}

    def test_integration_rewrites_all_anchors(self):
        fixtures = self.make_fixture()
        updated = integrate_public_home.build_changes(fixtures)
        self.assertEqual(len(updated), 11)
        for path in fixtures:
            self.assertNotEqual(fixtures[path], updated[path], path)
        self.assertIn("if ((view === 'dashboard' || view === 'jukebox')", updated['frontend/src/App.jsx'])
        self.assertIn('credentials', updated['frontend/src/components/ScientificJukebox.jsx'])
        self.assertIn("path.startswith('/api/science/')", updated['backend/main.py'])

    def test_integration_is_idempotent(self):
        changed = integrate_public_home.build_changes(self.make_fixture())
        self.assertEqual(changed, integrate_public_home.build_changes(changed))

    def test_integration_fails_without_anchor(self):
        fixtures = self.make_fixture()
        fixtures['frontend/src/App.jsx'] = 'Not the expected project App.jsx'
        with self.assertRaises(RuntimeError):
            integrate_public_home.build_changes(fixtures)


if __name__ == '__main__':
    unittest.main()
