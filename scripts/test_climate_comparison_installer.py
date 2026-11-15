import tempfile
import unittest
from pathlib import Path

from install_climate_comparison import REQUIRED_FILES, install, patch_home

HOME = '''import React from 'react';
import StationSelector from '../components/StationSelector';
import ScientificJukebox from '../components/ScientificJukebox';
export default function Home({ isAuthenticated = false, scienceStopSignal = 0, onRequestAuth }) {
  return (
    <div className="es-home editorial-home">
      {isAuthenticated && <ScientificJukebox stopSignal={scienceStopSignal}/>}
      <StationSelector stations={[]} />
    </div>
  );
}
'''

class InstallerTests(unittest.TestCase):
    def create_repo(self, folder):
        root = Path(folder)
        page = root / 'frontend/src/pages/Home.jsx'
        page.parent.mkdir(parents=True)
        page.write_text(HOME, encoding='utf-8')
        for rel in REQUIRED_FILES:
            dest = root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text('placeholder', encoding='utf-8')
        backend = root / 'backend/main.py'
        backend.parent.mkdir(parents=True)
        backend.write_text('DO NOT ALTER', encoding='utf-8')
        return root, page, backend

    def test_page_integration_and_audio_exclusivity(self):
        updated = patch_home(HOME)
        self.assertIn('<ClimateComparison', updated)
        self.assertIn('stopSignal={scienceStopSignal + scienceStopFromCompare}', updated)
        self.assertIn('stopSignal={scienceStopSignal + compareStopFromScience}', updated)
        self.assertIn('onSciencePlay={() => setCompareStopFromScience', updated)
        self.assertIn('onSciencePlay={() => setScienceStopFromCompare', updated)
        self.assertIn('onRequestAuth', updated)

    def test_installer_idempotency_and_preserves_backend(self):
        with tempfile.TemporaryDirectory() as tmp:
            root, page, backend = self.create_repo(tmp)
            changed, backup = install(root)
            self.assertTrue(changed)
            self.assertIsNotNone(backup)
            self.assertEqual(backup.read_text(encoding='utf-8'), HOME)
            self.assertEqual(backend.read_text(encoding='utf-8'), 'DO NOT ALTER')
            changed, backup = install(root)
            self.assertFalse(changed)
            self.assertIsNone(backup)
            self.assertEqual(page.read_text().count('<ClimateComparison'), 1)

    def test_refuses_old_home(self):
        self.assertRaises(RuntimeError, patch_home, HOME.replace('es-home editorial-home', 'editorial-home'))

    def test_refuses_missing_scientific_anchor(self):
        self.assertRaises(RuntimeError, patch_home, HOME.replace('<ScientificJukebox', '<OtherJukebox'))

    def test_missing_component_does_not_touch_home(self):
        with tempfile.TemporaryDirectory() as tmp:
            root, page, _ = self.create_repo(tmp)
            (root / REQUIRED_FILES[0]).unlink()
            self.assertRaises(RuntimeError, install, root)
            self.assertEqual(page.read_text(encoding='utf-8'), HOME)

if __name__ == '__main__':
    unittest.main()
