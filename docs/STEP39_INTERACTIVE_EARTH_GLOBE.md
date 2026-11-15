# Earthsonic — Interactive Earth globe location selector

This update replaces the two always-visible latitude and longitude inputs in the Scientific Jukebox, NASA Climate Lab and NASA Temperature Lab with a selectable Earth sphere. Coordinates are still passed to the existing NASA POWER API; dates and audio mapping are unchanged.

## Features

- Drag the globe to rotate it, then click or tap to choose the NASA data location
- The red marker identifies the selected location
- Click a location shortcut for Nagpur, New York, Tokyo or Sydney
- Click **Center selection** to return to your selected location
- Keyboard accessibility: arrows rotate, Enter/Space selects the center
- **Enter precise coordinates instead** expands an optional fallback for exact scientific locations
- No network dependency or new npm packages for globe rendering
- Natural Earth world land geometry, public domain (Natural Earth and its standard 110m low-resolution dataset)

## Installation

Extract the archive into the repository root, then execute:

```powershell
.\backend\.venv\Scripts\python.exe .\scripts\integrate_earth_globe.py
node --test .\frontend\src\services\globeMath.test.mjs
.\backend\.venv\Scripts\python.exe -m unittest discover -s scripts -p test_earth_globe_installer.py -v
npm run build --prefix .\frontend
.\backend\.venv\Scripts\python.exe -m pytest backend -q
```

## UI behavior

Choose a point on the globe. The coordinates update instantly, but a new NASA request is made **only** when you click the existing **Load scientific data**, **Load 3 Datasets**, or **Load NASA Data** button. The user must remain logged in under the Step 37 authentication gate. This globe does not use browser GPS and does not imply the readings were measured at the selected spot by an on-site instrument.

## Artwork / attribution

Globe texture constructed from Natural Earth low-resolution world land geometry (Natural Earth public-domain GIS data), with original Earthsonic colors. No remote images or map servers are required.
