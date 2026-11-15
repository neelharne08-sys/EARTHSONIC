import unittest

from scripts.install_cinematic_home import MARKER, update_hero

SAMPLE_ORIGINAL = """import React from 'react';
import { NASA_CHALLENGE_INFO } from '../data/stations';
export default function Hero({ onLaunchJukebox, onSelectStation, canInteract = false, onRequireAuth }) {
  const handleAuditoryDemo = () => { return null; };
  return null;
}
"""

SAMPLE_NEW = """import CinematicEarthHero from './CinematicEarthHero';
export default function Hero({ onLaunchJukebox, canInteract = false, onRequireAuth }) {
  return null;
}
"""


class CinematicInstallerTests(unittest.TestCase):
    def test_replaces_supported_hero(self):
        self.assertEqual(update_hero(SAMPLE_ORIGINAL, SAMPLE_NEW), SAMPLE_NEW)

    def test_reapplication_is_idempotent(self):
        self.assertIn(MARKER, SAMPLE_NEW)
        self.assertEqual(update_hero(SAMPLE_NEW, SAMPLE_NEW), SAMPLE_NEW)

    def test_unexpected_hero_does_not_get_overwritten(self):
        with self.assertRaisesRegex(RuntimeError, 'Unexpected Hero'):
            update_hero('export default function Hero() { return null; }', SAMPLE_NEW)

    def test_modified_cinematic_hero_does_not_get_overwritten(self):
        with self.assertRaisesRegex(RuntimeError, 'modified'):
            update_hero(SAMPLE_NEW + '\ncustom modification', SAMPLE_NEW)


if __name__ == '__main__':
    unittest.main()
