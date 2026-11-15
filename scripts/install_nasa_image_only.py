from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKUP_ROOT = ROOT.parent / 'earthsonic_image_only_backups'
STATIONS_PATH = Path('frontend/src/data/stations.js')
JUKEBOX_PATH = Path('frontend/src/pages/Jukebox.jsx')


def modify_stations(source: str) -> str:
    expression = re.compile(r"(\n  \{\n    id: '(svs-\d+)',)(.*?)(?=\n  \{\n    id: 'svs-|\n\];)", re.S)
    matched = []

    def update(match: re.Match) -> str:
        prefix, key, body = match.group(1), match.group(2), match.group(3)
        matched.append(key)
        pattern = re.compile(r"thumbnail: '[^']*'")
        if len(pattern.findall(body)) != 1:
            raise RuntimeError(f'{key}: thumbnail not found exactly once')
        extension = '.png' if key in ('svs-5533', 'svs-5669') else '.jpg'
        body = pattern.sub(f"thumbnail: '/nasa-stills/{key}{extension}'", body)
        return prefix + body

    changed = expression.sub(update, source)
    expected = {'svs-4950', 'svs-4960', 'svs-5011', 'svs-5196', 'svs-5425', 'svs-5533', 'svs-5669', 'svs-3912', 'svs-5313', 'svs-13786'}
    if set(matched) != expected or len(matched) != 10:
        raise RuntimeError(f'Expected 10 NASA station entries, found: {matched}')
    return changed


def modify_jukebox(source: str) -> str:
    old_import = "import EarthVideoPlayer from '../components/EarthVideoPlayer';"
    new_import = "import EarthImageViewer from '../components/EarthImageViewer';"
    if old_import in source:
        source = source.replace(old_import, new_import, 1)
    elif new_import not in source:
        raise RuntimeError('Jukebox video-component import changed; no files were modified')

    if '<EarthVideoPlayer' in source:
        source = source.replace('<EarthVideoPlayer', '<EarthImageViewer', 1)
    if source.count('<EarthImageViewer') != 1:
        raise RuntimeError('Unable to find the single NASA media viewport')

    original_timeline_import = "import Timeline from '../components/Timeline';"
    replacement_timeline_import = "import ImageBrightnessTimeline from '../components/ImageBrightnessTimeline';"
    if original_timeline_import in source:
        source = source.replace(original_timeline_import, replacement_timeline_import, 1)
    elif replacement_timeline_import not in source:
        raise RuntimeError('Timeline import changed unexpectedly')

    original_timeline = """            <Timeline
              station={selectedStation}
              timelineData={timelineData}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />"""
    replacement_timeline = """            <ImageBrightnessTimeline
              brightness={earthPulseData?.brightness || []}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />"""
    if original_timeline in source:
        source = source.replace(original_timeline, replacement_timeline, 1)
    elif replacement_timeline not in source:
        raise RuntimeError('Timeline markup changed unexpectedly')
    if 'isLooping={isLooping}' not in source[source.index('<EarthImageViewer'):source.index('<EarthImageViewer') + 430]:
        source = source.replace('<EarthImageViewer\n', '<EarthImageViewer\n              isLooping={isLooping}\n', 1)

    image_import = "import { loadNasaImageSonification } from '../services/nasaImageSonification.mjs';"
    if image_import not in source:
        source = image_import + '\n' + source

    old_load = re.compile(
        r"[ \t]*const sonification = await dataService\.fetchEarthPulseSonification\(backendUrl\);\s*"
        r"if \(mounted\) \{\s*setEarthPulseData\(sonification\);\s*\}",
        re.M
    )
    source, number = old_load.subn('', source, count=1)
    if number == 0 and 'fetchEarthPulseSonification(backendUrl)' in source and 'async function initBackend' in source:
        raise RuntimeError('Backend initializer has unexpected structure; no files were modified')

    station_effect = '''
  useEffect(() => {
    let active = true;
    setEarthPulseData(null);
    loadNasaImageSonification(selectedStation.id)
      .then(data => {
        if (active) setEarthPulseData(data);
      })
      .catch(error => {
        if (active) console.warn('NASA image feature analysis unavailable:', error.message);
      });
    return () => { active = false; };
  }, [selectedStation.id]);
'''
    if 'NASA image feature analysis unavailable:' not in source:
        marker = '  // Check EarthPulse FastAPI backend connection on mount & load sonification data'
        if marker not in source:
            marker = '  // When station changes, update tracks and load timeline'
        if marker not in source:
            raise RuntimeError('No safe insertion point for NASA image analysis')
        source = source.replace(marker, station_effect + '\n' + marker, 1)

    old_sync = '''    const sonification = await dataService.fetchEarthPulseSonification(backendUrl);
    setEarthPulseData(sonification);'''
    new_sync = '''    try {
      const sonification = await loadNasaImageSonification(selectedStation.id);
      setEarthPulseData(sonification);
    } catch (error) {
      console.warn('NASA image analysis failed:', error.message);
      setEarthPulseData(null);
    }'''
    if old_sync in source:
        source = source.replace(old_sync, new_sync, 1)
    elif new_sync not in source and 'fetchEarthPulseSonification(backendUrl)' in source:
        raise RuntimeError('Sync button has unexpected implementation')

    source = source.replace(
        'Connected to EarthPulse FastAPI backend. Received 100 normalized brightness values and frequencies between 180 and 760 Hertz.',
        'Connected to the Earthsonic backend. This station uses NASA still-image feature sonification with 100 display-luminance samples.'
    )
    source = source.replace(
        'EarthPulse backend is in calibrated standby mode. Sonification engine ready.',
        'Backend is in standby. Image-feature sonification can run locally from downloaded NASA still images.'
    )

    source = source.replace('    setTracksState(newTrackState);\n    setCurrentTime(0);', '    setTracksState(newTrackState);\n    setIsPlaying(false);\n    setCurrentTime(0);', 1)

    if '<EarthVideoPlayer' in source or "import EarthVideoPlayer" in source:
        raise RuntimeError('Video component still active')
    return source


def main() -> None:
    image_dir = ROOT / 'frontend/public/nasa-stills'
    required = [image_dir / (f'svs-{id}' + ('.png' if id in ('5533', '5669') else '.jpg')) for id in
                ('4950', '4960', '5011', '5196', '5425', '5533', '5669', '3912', '5313', '13786')]
    missing = [path.name for path in required if not path.is_file()]
    if missing:
        raise RuntimeError('First download official images: .\\backend\\.venv\\Scripts\\python.exe .\\scripts\\download_nasa_stills.py. Missing: ' + ', '.join(missing))

    current = {STATIONS_PATH: (ROOT / STATIONS_PATH).read_text(encoding='utf-8'),
               JUKEBOX_PATH: (ROOT / JUKEBOX_PATH).read_text(encoding='utf-8')}
    updated = {STATIONS_PATH: modify_stations(current[STATIONS_PATH]),
               JUKEBOX_PATH: modify_jukebox(current[JUKEBOX_PATH])}

    changed = [path for path in updated if updated[path] != current[path]]
    if not changed:
        print('NASA image-first experience already installed.')
        return

    backup = BACKUP_ROOT / datetime.now().strftime('%Y%m%d_%H%M%S')
    for path in changed:
        destination = backup / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / path, destination)
    for path in changed:
        (ROOT / path).write_text(updated[path], encoding='utf-8')
        print('Updated:', path)
    print('Image-first Jukebox installed. Backup:', backup)
    print('The backend and database were not modified.')


if __name__ == '__main__':
    main()
