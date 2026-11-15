import unittest

from scripts.integrate_scientific_jukebox import apply_patch


class ScientificJukeboxInstallerTests(unittest.TestCase):
    def fixture(self):
        return "\n".join([
            "import MixStudio from '../components/MixStudio';",
            "  const [speechActive, setSpeechActive] = useState(true);",
            "    setIsPlaying(false);",
            "    setCurrentTime(0);",
            "    audioEngine.stopEarthPulse();",
            "  // Real-time audio frequency stream modulation during playback",
            "    if (nextState) {",
            "      audioEngine.init();",
            "        {/* Workstation Grid */}",
        ])

    def test_installer_applies_all_six_changes(self):
        modified, changed = apply_patch(self.fixture())
        self.assertTrue(changed)
        self.assertIn('import ScientificJukebox', modified)
        self.assertIn('<ScientificJukebox', modified)
        self.assertIn('stopSignal={scienceStopSignal}', modified)

    def test_second_run_makes_no_changes(self):
        modified, _ = apply_patch(self.fixture())
        repeated, changed = apply_patch(modified)
        self.assertFalse(changed)
        self.assertEqual(repeated, modified)

    def test_invalid_original_is_rejected(self):
        with self.assertRaises(RuntimeError):
            apply_patch(self.fixture().replace("        {/* Workstation Grid */}", ''))


if __name__ == '__main__':
    unittest.main()
