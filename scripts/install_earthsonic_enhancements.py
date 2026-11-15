from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JUKEBOX = Path('frontend/src/pages/Jukebox.jsx')
VIEWER = Path('frontend/src/components/EarthImageViewer.jsx')
BACKUP_ROOT = ROOT.parent / 'earthsonic_step48_backups'
REQUIRED = (
    'frontend/src/components/EarthsonicEnhancements.jsx',
    'frontend/src/components/EarthsonicEnhancements.css',
    'frontend/src/services/imageAudioExport.mjs',
    'frontend/src/services/imageAudioExport.test.mjs',
)


def modify_jukebox(source: str) -> str:
    new_import = "import EarthsonicEnhancements from '../components/EarthsonicEnhancements';"
    new_block = '''        <EarthsonicEnhancements
          station={selectedStation}
          analysis={earthPulseData}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
        />

'''
    old_import = "import EarthImageViewer from '../components/EarthImageViewer';"
    target = '        <ScientificJukebox\n'
    if new_import in source and new_block in source:
        return source
    if 'import EarthVideoPlayer' in source or '<EarthVideoPlayer' in source:
        raise RuntimeError('Step 47 image-only Jukebox is required. Do not install Step 48 over the video version.')
    if new_import in source or '<EarthsonicEnhancements' in source:
        raise RuntimeError('Incomplete Step 48 installation detected; no files were written.')
    if source.count(old_import) != 1 or source.count(target) != 1:
        raise RuntimeError('Expected Step 47 Jukebox anchors are missing; no files were written.')
    if 'const handlePlayPause = ' not in source or 'const handleSeek = ' not in source:
        raise RuntimeError('Playback handlers not found; no files were written.')
    source = source.replace(old_import, old_import + '\n' + new_import, 1)
    source = source.replace(target, new_block + target, 1)
    source = source.replace('FastAPI Pillow Image Scanner • 100 Normalized Brightness & Frequencies (180 – 760 Hz)',
                            'Browser Canvas image scan • 100 normalized display-brightness samples (180–760 Hz)')
    source = source.replace('GET /api/sonification ONLINE', 'FastAPI ONLINE')
    source = source.replace('STANDBY (Calibrated 100-pt Sonification)', 'Backend standby • local image scanning works')
    source = source.replace('title="Poll GET /api/health and /api/sonification"',
                            'title="Check backend health and reload current NASA image analysis"')
    source = source.replace('EarthPulse Synchronized', 'Image-derived sound · not physical measurements')
    return source


def modify_viewer(source: str) -> str:
    if 'NASA SVS IMAGE VIEWER' not in source:
        raise RuntimeError('Step 47 NASA image viewer not found; no files were written.')
    if 'id="earthsonic-image-viewer"' not in source:
        source = source.replace('<section className="overflow-hidden rounded-[28px]',
                                '<section id="earthsonic-image-viewer" className="overflow-hidden rounded-[28px]', 1)
    source = source.replace('absolute inset-y-0 w-[2px] bg-[#FC3D21]',
                            'absolute inset-y-0 w-[2px] motion-reduce:hidden bg-[#FC3D21]')
    if 'motion-reduce:transition-none' not in source:
        source = source.replace('h-2 rounded-full bg-[#0B3D91] transition-[width] duration-75',
                                'h-2 rounded-full bg-[#0B3D91] transition-[width] duration-75 motion-reduce:transition-none')
    return source


def compute_updates(project: Path) -> dict[Path, str]:
    for filename in REQUIRED:
        if not (project / filename).is_file():
            raise RuntimeError(f'Missing Step 48 package file: {filename}. Extract the entire ZIP first.')
    files = {JUKEBOX: modify_jukebox, VIEWER: modify_viewer}
    original = {p: (project / p).read_text(encoding='utf-8') for p in files}
    changed = {p: operation(original[p]) for p, operation in files.items()}
    return {p: content for p, content in changed.items() if content != original[p]}


def install(project: Path = ROOT, backup_root: Path = BACKUP_ROOT) -> list[Path]:
    changes = compute_updates(project)
    if not changes:
        return []
    backup = backup_root / datetime.now().strftime('%Y%m%d_%H%M%S_%f')
    for rel in changes:
        output = backup / rel
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(project / rel, output)
    for rel, data in changes.items():
        (project / rel).write_text(data, encoding='utf-8')
        print('Updated:', rel)
    print('Backups:', backup)
    return list(changes)


def main() -> None:
    results = install()
    if not results:
        print('Step 48 enhancement pack already installed. No changes needed.')
    else:
        print('Step 48 installed. The backend, SQLite database and existing NASA images were not modified.')


if __name__ == '__main__':
    main()
