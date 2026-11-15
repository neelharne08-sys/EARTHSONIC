from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path

APP_IMPORT = "import './styles/earthsonic-redesign.css';"
FILES = (
    'frontend/src/components/CinematicEarthHero.css',
    'frontend/src/components/CinematicEarthHero.jsx',
    'frontend/src/components/CinematicHeroLayout.css',
    'frontend/src/components/GuestSciencePreview.jsx',
    'frontend/src/components/Hero.jsx',
    'frontend/src/components/StationCard.jsx',
    'frontend/src/components/StationSelector.jsx',
    'frontend/src/pages/Home.jsx',
    'frontend/src/styles/earthsonic-redesign.css',
)
EXISTING_COMPONENT_CHECKS = {
    'frontend/src/components/Hero.jsx': 'export default function Hero',
    'frontend/src/components/GuestSciencePreview.jsx': 'export default function GuestSciencePreview',
    'frontend/src/components/StationCard.jsx': 'export default function StationCard',
    'frontend/src/components/StationSelector.jsx': 'export default function StationSelector',
    'frontend/src/pages/Home.jsx': 'export default function Home',
}


def plan(root: Path, package_root: Path) -> dict[Path, bytes]:
    root = Path(root)
    package_root = Path(package_root)
    app = root / 'frontend/src/App.jsx'
    if not app.is_file():
        raise RuntimeError('Could not locate frontend/src/App.jsx. Run from the Earthsonic repository root.')
    text = app.read_text(encoding='utf-8')
    if 'export default function App' not in text or 'import React' not in text:
        raise RuntimeError('Unexpected App.jsx. No changes made.')
    if text.count(APP_IMPORT) > 1:
        raise RuntimeError('Duplicate redesign import in App.jsx. No changes made.')
    for rel, token in EXISTING_COMPONENT_CHECKS.items():
        target = root / rel
        if not target.is_file() or token not in target.read_text(encoding='utf-8'):
            raise RuntimeError(f'Unexpected file {rel}. No changes made.')
    changes: dict[Path, bytes] = {}
    for rel in FILES:
        source = package_root / 'redesign_templates' / rel
        if not source.is_file():
            raise RuntimeError(f'Missing redesign template: {rel}')
        proposed = source.read_bytes()
        target = root / rel
        if not target.is_file() or target.read_bytes() != proposed:
            changes[target] = proposed
    if APP_IMPORT not in text:
        lines = text.splitlines(keepends=True)
        index = next((i for i, line in enumerate(lines) if line.startswith('import React')), None)
        if index is None:
            raise RuntimeError('App.jsx import anchor not found. No changes made.')
        lines.insert(index + 1, APP_IMPORT + '\n')
        changes[app] = ''.join(lines).encode('utf-8')
    return changes


def install(root: Path, package_root: Path) -> tuple[int, Path | None]:
    changes = plan(root, package_root)
    if not changes:
        return 0, None
    backup_home = Path(root).parent / 'earthsonic_redesign_backups'
    backup = backup_home / datetime.now().strftime('step43_%Y%m%d_%H%M%S_%f')
    for target in changes:
        if target.exists():
            relative = target.relative_to(root)
            original = backup / relative
            original.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, original)
    for target, contents in changes.items():
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_name(target.name + '.step43.tmp')
        try:
            temporary.write_bytes(contents)
            temporary.replace(target)
        finally:
            temporary.unlink(missing_ok=True)
        print(f'Updated: {target.relative_to(root)}')
    return len(changes), backup


def main() -> None:
    root = Path.cwd()
    package_root = Path(__file__).resolve().parent.parent
    count, backup = install(root, package_root)
    if count == 0:
        print('Earthsonic redesign already installed. No changes needed.')
    else:
        print(f'Installed {count} Earthsonic redesign files.')
        print(f'Backups of replaced files: {backup}')
        print('No backend, NASA APIs, authentication, or database files were modified.')


if __name__ == '__main__':
    main()
