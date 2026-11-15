from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TARGET_HERO = PROJECT_ROOT / 'frontend/src/components/Hero.jsx'
TEMPLATE = PROJECT_ROOT / 'scripts/templates/Hero.Cinematic.jsx'
MARKER = "import CinematicEarthHero from './CinematicEarthHero';"
ORIGINAL_MARKERS = (
    "export default function Hero({ onLaunchJukebox, onSelectStation, canInteract = false, onRequireAuth })",
    "const handleAuditoryDemo = () => {",
    "NASA_CHALLENGE_INFO"
)


def update_hero(source, replacement):
    if MARKER in source:
        if source == replacement:
            return source
        raise RuntimeError('Existing cinematic homepage was modified; refusing to overwrite it.')
    if not all(marker in source for marker in ORIGINAL_MARKERS):
        raise RuntimeError('Unexpected Hero.jsx version; no files were overwritten. Inspect it before retrying.')
    return replacement


def main():
    existing = TARGET_HERO.read_text(encoding='utf-8')
    replacement = TEMPLATE.read_text(encoding='utf-8')
    output = update_hero(existing, replacement)
    required = (
        'frontend/src/components/CinematicEarthHero.jsx',
        'frontend/src/components/CinematicEarthHero.css',
        'frontend/src/components/CinematicHeroLayout.css',
        'frontend/public/earthsonic-earth-nasa.jpg',
        'frontend/src/services/audioEngine.js'
    )
    missing = [path for path in required if not (PROJECT_ROOT / path).is_file()]
    if missing:
        raise RuntimeError('Missing required project files: ' + ', '.join(missing))
    if output == existing:
        print('Cinematic homepage already installed; nothing changed.')
        return
    TARGET_HERO.write_text(output, encoding='utf-8')
    print('Updated: frontend/src/components/Hero.jsx')
    print('Cinematic NASA Earth homepage installed. Run Vite build and browser smoke tests.')


if __name__ == '__main__':
    main()
