# Step 47 — NASA image-first Earth Information Jukebox

Earthsonic's primary Jukebox station media are now static images from NASA's Scientific Visualization Studio (SVS). No videos are necessary for this experience.

## What changes

- Downloads ten NASA SVS still images into `frontend/public/nasa-stills` (offline-ready).
- Changes station thumbnails to these authentic NASA stills, replacing unrelated stock thumbnails.
- Replaces the video viewport with a still-image viewer and a moving scan cursor; it does not claim that the source image animates.
- The 45-second clock is an **artistic scan duration**, NOT a date, timestamp or time resolution of the NASA observation.
- The audio is calculated from visible image brightness (100 vertical luminance bins), not from underlying scientific values. The brightness is normalized per image and mapped to 180–760 Hz. This audio is not a recorded NASA sound.
- NASA POWER temperature, humidity and wind data are separate authenticated scientific-data features; keep their units, dates and provenance.
- Keeps FastAPI, NASA POWER endpoints, SQLite user accounts, favorites, saved mixes, and existing globe untouched.
- Leaves the earlier EarthVideoPlayer component and videoUrl metadata in place as inactive legacy; these can be cleaned up after integration review.
- Replaces the Jukebox timeline chart with an actual displayed-image brightness profile derived from the current NASA still. Legacy dataService timeline internals remain for other screens; their synthetic values must not be described as measurements.

## Official source pages

- https://svs.gsfc.nasa.gov/4950/ — GEDI forest height
- https://svs.gsfc.nasa.gov/4960/ — atmospheric river
- https://svs.gsfc.nasa.gov/5011/ — LIS lightning
- https://svs.gsfc.nasa.gov/5196/ — DYAMOND carbon dioxide
- https://svs.gsfc.nasa.gov/5425/ — ocean currents
- https://svs.gsfc.nasa.gov/5533/ — air quality
- https://svs.gsfc.nasa.gov/5669/ — aerosols still
- https://svs.gsfc.nasa.gov/3912/ — sea surface currents
- https://svs.gsfc.nasa.gov/5313/ — night lights
- https://svs.gsfc.nasa.gov/13786/ — Caldwell 73 (astronomy reference)

Credits: NASA Scientific Visualization Studio. For Caldwell 73, see its page for additional credit to SYSTEM Sounds.

## Setup

Run from E:\SAHIL\nasa_spaceapps, using an existing feature branch. Backups of changed tracked files are saved under E:\SAHIL\earthsonic_image_only_backups.

1. Extract the Step 47 ZIP into the repo root using Expand-Archive -Force.
2. Run `.\backend\.venv\Scripts\python.exe .\scripts\download_nasa_stills.py` (internet required once).
3. Run `.\backend\.venv\Scripts\python.exe .\scripts\install_nasa_image_only.py`.
4. Run the Python and Node tests and `npm run build --prefix .\frontend`.
5. Test every station's still image, sound, image scan, scrubbing, pause/resume, saved mixes, and NASA POWER workflows.

Do not run the earlier Step 46 video-fix installer after installing image-only mode.
