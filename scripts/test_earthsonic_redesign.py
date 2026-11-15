from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from install_earthsonic_redesign import FILES, APP_IMPORT, install, plan

PKG = Path(__file__).resolve().parent.parent


def make_repo(root):
    files = {
        'frontend/src/App.jsx': "import React from 'react';\nexport default function App(){ return null; }\n",
        'frontend/src/components/Hero.jsx': 'export default function Hero() {}\n',
        'frontend/src/components/GuestSciencePreview.jsx': 'export default function GuestSciencePreview() {}\n',
        'frontend/src/components/StationCard.jsx': 'export default function StationCard() {}\n',
        'frontend/src/components/StationSelector.jsx': 'export default function StationSelector() {}\n',
        'frontend/src/pages/Home.jsx': 'export default function Home() {}\n'
    }
    for path, contents in files.items():
        target = root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(contents, encoding='utf-8')


class RedesignInstallerTests(unittest.TestCase):
    def test_installer_copies_all_templates_and_patches_app_once(self):
        with TemporaryDirectory() as temp:
            root = Path(temp) / 'site'
            make_repo(root)
            count, backup = install(root, PKG)
            self.assertEqual(count, len(FILES) + 1)
            self.assertTrue(backup.exists())
            for rel in FILES:
                self.assertEqual((root / rel).read_bytes(), (PKG / 'redesign_templates' / rel).read_bytes())
            self.assertEqual((root / 'frontend/src/App.jsx').read_text().count(APP_IMPORT), 1)

    def test_second_run_is_noop(self):
        with TemporaryDirectory() as temp:
            root = Path(temp) / 'site'
            make_repo(root)
            install(root, PKG)
            count, backup = install(root, PKG)
            self.assertEqual(count, 0)
            self.assertIsNone(backup)

    def test_reject_unexpected_component_without_writing(self):
        with TemporaryDirectory() as temp:
            root = Path(temp) / 'site'
            make_repo(root)
            target = root / 'frontend/src/components/Hero.jsx'
            target.write_text('unrelated content')
            with self.assertRaises(RuntimeError):
                plan(root, PKG)
            self.assertEqual(target.read_text(), 'unrelated content')
            self.assertFalse((root / 'frontend/src/styles/earthsonic-redesign.css').exists())

    def test_installer_does_not_modify_backend(self):
        with TemporaryDirectory() as temp:
            root = Path(temp) / 'site'
            make_repo(root)
            backend = root / 'backend/main.py'
            backend.parent.mkdir(exist_ok=True)
            backend.write_bytes(b'raise RuntimeError("DO NOT CHANGE")\n')
            install(root, PKG)
            self.assertEqual(backend.read_bytes(), b'raise RuntimeError("DO NOT CHANGE")\n')

    def test_station_audition_requires_account(self):
        source = (PKG / 'redesign_templates/frontend/src/components/StationCard.jsx').read_text()
        self.assertIn('if (!canInteract)', source)
        self.assertIn('onSelect(station);', source)
        self.assertIn('audioEngine.playStationPreview(station.id)', source)
        self.assertLess(source.index('if (!canInteract)'), source.index('audioEngine.playStationPreview(station.id)'))


if __name__ == '__main__':
    unittest.main()
