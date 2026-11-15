import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name('install_earthsonic_enhancements.py')
spec = importlib.util.spec_from_file_location('installer', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

BASE_JUKEBOX = '''import React from 'react';
import EarthImageViewer from '../components/EarthImageViewer';
import ScientificJukebox from '../components/ScientificJukebox';
export default function Jukebox() {
  const handlePlayPause = () => {};
  const handleSeek = () => {};
  return (
    <div>
      <EarthImageViewer />
        <ScientificJukebox
          stopSignal={0}
        />
    </div>
  );
}
'''
BASE_VIEWER = '''import React from 'react';
export default function EarthImageViewer() {
 return <section className="overflow-hidden rounded-[28px]">
   NASA SVS IMAGE VIEWER
   <span className="absolute inset-y-0 w-[2px] bg-[#FC3D21]" />
   <span className="h-2 rounded-full bg-[#0B3D91] transition-[width] duration-75" />
 </section>;
}
'''


class InstallerTests(unittest.TestCase):
    def test_injects_panel_one_time_and_updates_browser_scanner_label(self):
        actual = module.modify_jukebox(BASE_JUKEBOX + '\nFastAPI Pillow Image Scanner • 100 Normalized Brightness & Frequencies (180 – 760 Hz)\n')
        self.assertEqual(actual.count('<EarthsonicEnhancements'), 1)
        self.assertEqual(actual.count("import EarthsonicEnhancements"), 1)
        self.assertIn('Browser Canvas image scan', actual)
        self.assertEqual(module.modify_jukebox(actual), actual)

    def test_rejects_video_only_jukebox(self):
        with self.assertRaisesRegex(RuntimeError, 'Step 47'):
            module.modify_jukebox(BASE_JUKEBOX.replace('EarthImageViewer', 'EarthVideoPlayer'))

    def test_rejects_missing_anchors_without_writing(self):
        with self.assertRaisesRegex(RuntimeError, 'anchors'):
            module.modify_jukebox(BASE_JUKEBOX.replace('<ScientificJukebox', '<Science'))

    def test_reduced_motion_viewer_patch_is_idempotent(self):
        result = module.modify_viewer(BASE_VIEWER)
        self.assertIn('id="earthsonic-image-viewer"', result)
        self.assertIn('motion-reduce:hidden', result)
        self.assertIn('motion-reduce:transition-none', result)
        self.assertEqual(module.modify_viewer(result), result)

    def test_creates_backup_before_edit_and_leaves_backend_untouched(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'repo'
            (root / module.JUKEBOX).parent.mkdir(parents=True)
            (root / module.VIEWER).parent.mkdir(parents=True)
            (root / module.JUKEBOX).write_text(BASE_JUKEBOX, encoding='utf-8')
            (root / module.VIEWER).write_text(BASE_VIEWER, encoding='utf-8')
            for path in module.REQUIRED:
                (root / path).parent.mkdir(parents=True, exist_ok=True)
                (root / path).write_text('Step48 new file', encoding='utf-8')
            backend = root / 'backend' / 'app.py'
            backend.parent.mkdir(parents=True)
            backend.write_text('original backend', encoding='utf-8')
            backup = Path(tmp) / 'safe-backups'
            changed = module.install(root, backup)
            self.assertEqual(set(changed), {module.JUKEBOX, module.VIEWER})
            backup_files = list(backup.rglob('Jukebox.jsx'))
            self.assertEqual(len(backup_files), 1)
            self.assertEqual(backup_files[0].read_text(), BASE_JUKEBOX)
            self.assertEqual(backend.read_text(), 'original backend')
            self.assertEqual(module.install(root, backup), [])
            self.assertEqual(len(list(backup.rglob('Jukebox.jsx'))), 1)

    def test_incomplete_package_does_not_modify_existing_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'repo'
            (root / module.JUKEBOX).parent.mkdir(parents=True)
            (root / module.VIEWER).parent.mkdir(parents=True)
            (root / module.JUKEBOX).write_text(BASE_JUKEBOX, encoding='utf-8')
            (root / module.VIEWER).write_text(BASE_VIEWER, encoding='utf-8')
            with self.assertRaisesRegex(RuntimeError, 'Missing Step 48 package'):
                module.install(root, Path(tmp) / 'backups')
            self.assertEqual((root / module.JUKEBOX).read_text(), BASE_JUKEBOX)


if __name__ == '__main__':
    unittest.main()
