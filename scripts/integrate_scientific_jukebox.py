from pathlib import Path
import os
import tempfile


def apply_patch(original):
    if "import ScientificJukebox from '../components/ScientificJukebox';" in original:
        if '<ScientificJukebox' in original and 'scienceStopSignal' in original:
            return original, False
        raise RuntimeError("Partial Step 36 installation detected; no files changed")

    changes = [
        (
            "import MixStudio from '../components/MixStudio';",
            "import MixStudio from '../components/MixStudio';\nimport ScientificJukebox from '../components/ScientificJukebox';",
            "ScientificJukebox import",
        ),
        (
            "  const [speechActive, setSpeechActive] = useState(true);",
            "  const [speechActive, setSpeechActive] = useState(true);\n  const [scienceStopSignal, setScienceStopSignal] = useState(0);",
            "science playback coordination state",
        ),
        (
            "    setIsPlaying(false);\n    setCurrentTime(0);\n    audioEngine.stopEarthPulse();",
            "    setIsPlaying(false);\n    setCurrentTime(0);\n    audioEngine.stopEarthPulse();\n    setScienceStopSignal((value) => value + 1);",
            "saved mix restoration coordination",
        ),
        (
            "  // Real-time audio frequency stream modulation during playback",
            "  useEffect(() => {\n    setScienceStopSignal((value) => value + 1);\n  }, [selectedStation.id]);\n\n  // Real-time audio frequency stream modulation during playback",
            "station switch coordination",
        ),
        (
            "    if (nextState) {\n      audioEngine.init();",
            "    if (nextState) {\n      setScienceStopSignal((value) => value + 1);\n      audioEngine.init();",
            "regular audio playback coordination",
        ),
        (
            "        {/* Workstation Grid */}",
            "        <ScientificJukebox\n          stopSignal={scienceStopSignal}\n          onSciencePlay={() => {\n            setIsPlaying(false);\n            audioEngine.stopEarthPulse();\n            if (typeof window !== 'undefined' && window.speechSynthesis) {\n              window.speechSynthesis.cancel();\n            }\n          }}\n        />\n\n        {/* Workstation Grid */}",
            "scientific workstation UI",
        ),
    ]

    result = original
    for before, after, label in changes:
        count = result.count(before)
        if count != 1:
            raise RuntimeError(f"Cannot safely apply {label}: found {count} anchors instead of one")
        result = result.replace(before, after, 1)
    return result, True


def main():
    root = Path(__file__).resolve().parent.parent
    jukebox = root / 'frontend' / 'src' / 'pages' / 'Jukebox.jsx'
    files = (
        root / 'frontend' / 'src' / 'components' / 'ScientificJukebox.jsx',
        root / 'frontend' / 'src' / 'services' / 'scientificPlayback.js',
        root / 'frontend' / 'src' / 'services' / 'scientificPlayback.test.mjs',
    )
    absent = [str(path.relative_to(root)) for path in (jukebox, *files) if not path.is_file()]
    if absent:
        raise RuntimeError(f"Step 36 files not found: {', '.join(absent)}")

    original = jukebox.read_text(encoding='utf-8')
    modified, changed = apply_patch(original)
    if not changed:
        print('Step 36 is already integrated; no files changed')
        return

    descriptor, temporary = tempfile.mkstemp(prefix='Jukebox-step36-', suffix='.jsx', dir=jukebox.parent)
    try:
        with os.fdopen(descriptor, 'w', encoding='utf-8', newline='\n') as handle:
            handle.write(modified)
        os.replace(temporary, jukebox)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

    print('Updated: frontend\\src\\pages\\Jukebox.jsx')
    print('Step 36 integrated successfully. Run Node science tests, Vite build and backend pytest.')


if __name__ == '__main__':
    main()
