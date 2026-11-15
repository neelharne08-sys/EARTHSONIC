from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(source, old, new, path):
    if new in source:
        return source
    count = source.count(old)
    if count != 1:
        raise RuntimeError(
            f"{path}: expected exactly one insertion point, found {count}: {old[:75]!r}"
        )
    return source.replace(old, new, 1)


def update_app(source):
    path = "frontend/src/App.jsx"
    changes = [
        (
            "  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);\n",
            "  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);\n  const [pendingMix, setPendingMix] = useState(null);\n"
        ),
        (
            "  function handleSelectStation(station) {\n    setSelectedStation(station);",
            "  function handleSelectStation(station) {\n    setPendingMix(null);\n    setSelectedStation(station);"
        ),
        (
            "  function handleAuthenticated(data) {",
            """  function handleLoadMix(mix) {
    if (!sessionRef.current?.user) return;

    const station = STATIONS.find((item) => item.id === mix.station_id);

    if (!station) {
      setAuthMessage('This saved mix references an unavailable station.');
      return;
    }

    setSelectedStation(station);
    setPendingMix((previous) => ({
      mix,
      requestId: (previous?.requestId || 0) + 1
    }));
    setAuthOpen(false);
    setCurrentView('jukebox');
    setAuthMessage(`Loaded mix "${mix.name}".`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleAuthenticated(data) {"""
        ),
        (
            "      setSession(null);\n      setFavorites([]);",
            "      setSession(null);\n      setPendingMix(null);\n      setFavorites([]);"
        ),
        (
            "            user={session.user}\n            stations={STATIONS}",
            "            user={session.user}\n            csrfToken={session.csrf_token}\n            onLoadMix={handleLoadMix}\n            stations={STATIONS}"
        ),
        (
            "          <Jukebox\n            selectedStation={selectedStation}",
            "          <Jukebox\n            user={session?.user || null}\n            csrfToken={session?.csrf_token || ''}\n            pendingMix={pendingMix}\n            onLoadMix={handleLoadMix}\n            selectedStation={selectedStation}"
        )
    ]
    for old, new in changes:
        source = replace_once(source, old, new, path)
    return source


def update_dashboard(source):
    path = "frontend/src/pages/Dashboard.jsx"
    changes = [
        (
            "import React from 'react';",
            "import React, { useState } from 'react';\nimport MixStudio from '../components/MixStudio';"
        ),
        (
            "  onExplore\n}) {",
            "  onExplore,\n  csrfToken = '',\n  onLoadMix\n}) {"
        ),
        (
            "  const email = user?.email || '';",
            "  const [savedMixCount, setSavedMixCount] = useState(null);\n  const email = user?.email || '';"
        ),
        (
            "      title: 'Saved Mixes',\n      value: 'Coming Soon',\n      subtitle: 'Your future sound creations',",
            "      title: 'Saved Mixes',\n      value: savedMixCount === null ? '...' : String(savedMixCount),\n      subtitle: 'Your saved sound configurations',"
        ),
        (
            '        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">',
            """        <MixStudio
          mode="dashboard"
          user={user}
          csrfToken={csrfToken}
          stations={stations}
          onLoadMix={onLoadMix}
          onCountChange={setSavedMixCount}
        />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">"""
        )
    ]
    for old, new in changes:
        source = replace_once(source, old, new, path)
    return source


def update_jukebox(source):
    path = "frontend/src/pages/Jukebox.jsx"
    changes = [
        (
            "import Timeline from '../components/Timeline';",
            "import Timeline from '../components/Timeline';\nimport MixStudio from '../components/MixStudio';"
        ),
        (
            "  onBackToHome \n}) {",
            "  onBackToHome,\n  user = null,\n  csrfToken = '',\n  pendingMix = null,\n  onLoadMix\n}) {"
        ),
        (
            "  // Real-time audio frequency stream modulation during playback",
            """  useEffect(() => {
    const mix = pendingMix?.mix;
    if (!mix || mix.station_id !== selectedStation.id) return;

    const settings = mix.settings;
    setMasterVolume(settings.master_volume);
    setIsMuted(settings.is_muted);
    setIsLooping(settings.is_looping);
    setOverlayActive(settings.overlay_active);
    setSpeechActive(settings.speech_active);
    setIsPlaying(false);
    setCurrentTime(0);
    audioEngine.stopEarthPulse();
    audioEngine.toggleSpeech(settings.speech_active);
    audioEngine.setMasterVolume(
      settings.is_muted ? 0 : settings.master_volume / 100
    );

    const restoredTracks = {};

    selectedStation.tracks.forEach((track) => {
      const saved = settings.tracks?.[track.id];
      const volume = saved?.volume ?? track.defaultVolume;
      const muted = saved?.muted ?? false;
      restoredTracks[track.id] = { volume, muted };
      audioEngine.setTrackVolume(track.id, muted ? 0 : volume / 100);
    });

    setTracksState(restoredTracks);
  }, [pendingMix, selectedStation.id]);

  // Real-time audio frequency stream modulation during playback"""
        ),
        (
            "        {/* Workstation Grid */}",
            """        <MixStudio
          mode="jukebox"
          user={user}
          csrfToken={csrfToken}
          stations={STATIONS}
          station={selectedStation}
          settings={{
            master_volume: masterVolume,
            is_muted: isMuted,
            is_looping: isLooping,
            overlay_active: overlayActive,
            speech_active: speechActive,
            tracks: tracksState
          }}
          onLoadMix={onLoadMix}
        />

        {/* Workstation Grid */}"""
        )
    ]
    for old, new in changes:
        source = replace_once(source, old, new, path)
    return source


def main():
    transforms = {
        "frontend/src/App.jsx": update_app,
        "frontend/src/pages/Dashboard.jsx": update_dashboard,
        "frontend/src/pages/Jukebox.jsx": update_jukebox
    }
    staged = {}

    for relative_path, transform in transforms.items():
        path = ROOT / relative_path
        if not path.is_file():
            raise FileNotFoundError(f"Missing file: {path}")

        original = path.read_text(encoding="utf-8-sig")
        updated = transform(original)
        staged[path] = (original, updated)

    for path, (original, updated) in staged.items():
        if updated == original:
            print(f"Already integrated: {path.relative_to(ROOT)}")
        else:
            path.write_text(updated, encoding="utf-8")
            print(f"Updated: {path.relative_to(ROOT)}")

    print("Saved Mixes frontend integration completed. Run npm run build --prefix .\\frontend")


if __name__ == '__main__':
    main()
