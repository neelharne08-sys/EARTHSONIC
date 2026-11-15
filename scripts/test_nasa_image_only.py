import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from install_nasa_image_only import modify_jukebox, modify_stations


class InstallTests(unittest.TestCase):
    def test_jukebox_replaces_only_media_component(self):
        source = '''import EarthVideoPlayer from '../components/EarthVideoPlayer';
import Timeline from '../components/Timeline';
  // When station changes, update tracks and load timeline
  // Check EarthPulse FastAPI backend connection on mount & load sonification data
    async function initBackend() {
      const sonification = await dataService.fetchEarthPulseSonification(backendUrl);
      if (mounted) {
        setEarthPulseData(sonification);
      }
    }
    const sonification = await dataService.fetchEarthPulseSonification(backendUrl);
    setEarthPulseData(sonification);
    <EarthVideoPlayer
      isPlaying={isPlaying}
      currentTime={currentTime}
    />
            <Timeline
              station={selectedStation}
              timelineData={timelineData}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />'''
        result = modify_jukebox(source)
        self.assertIn('<EarthImageViewer', result)
        self.assertIn('isLooping={isLooping}', result)
        self.assertIn('loadNasaImageSonification(selectedStation.id)', result)
        self.assertNotIn('fetchEarthPulseSonification(backendUrl)', result)
        self.assertNotIn('<EarthVideoPlayer', result)
        self.assertIn('ImageBrightnessTimeline', result)
        self.assertIn('brightness={earthPulseData?.brightness || []}', result)
        self.assertEqual(modify_jukebox(result), result)

    def test_stations_switch_to_official_local_images(self):
        keys = ['4950', '4960', '5011', '5196', '5425', '5533', '5669', '3912', '5313', '13786']
        src = 'export const STATIONS = [\n' + ''.join(
            f"  {{\n    id: 'svs-{key}',\n    thumbnail: 'https://unsplash.com/{key}',\n    videoUrl: 'a.mp4'\n  }},\n" for key in keys
        ) + '];\n'
        result = modify_stations(src)
        self.assertEqual(result.count('/nasa-stills/'), 10)
        self.assertNotIn('unsplash.com', result)
        self.assertEqual(modify_stations(result), result)

    def test_missing_anchor_fails_without_writing(self):
        with self.assertRaises(RuntimeError):
            modify_jukebox('const unrelated = true;')


if __name__ == '__main__':
    unittest.main()
