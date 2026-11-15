import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from enhance_earth_globe import upgrade

OLD = Path(__file__).parent / 'fixtures' / 'GlobeLocationPicker_Step39.jsx'


class GlobeUpgradeTests(unittest.TestCase):
    def test_full_upgrade(self):
        source = OLD.read_text(encoding='utf-8')
        result = upgrade(source)
        self.assertIn('getVisibleCountryLabels', result)
        self.assertIn('Country names:', result)
        self.assertIn('earthsonic-earth-nasa.jpg', result)
        self.assertIn('onPointerMove={onPointerMove}', result)
        self.assertIn('onChange({ latitude:', result)

    def test_idempotent(self):
        source = OLD.read_text(encoding='utf-8')
        upgraded = upgrade(source)
        self.assertEqual(upgrade(upgraded), upgraded)

    def test_broken_source_does_not_overwrite(self):
        with self.assertRaises(RuntimeError):
            upgrade('export default function GlobeLocationPicker() {}')


if __name__ == '__main__':
    unittest.main()
