# Earthsonic Step 40 — NASA Blue Marble Globe + Country Labels

## What's improved

- NASA Blue Marble global surface photography (offline after download) with realistic spherical lighting
- Approximately 136 country-name anchor points, derived from countryinfo geographic label data; labels rotate with the globe and disappear on the far side
- Collision-reduced labels; toggle country names on or off
- Original drag, click, precise coordinates, quick locations, and NASA POWER data requests remain intact
- Graceful fallback to the existing Earth texture if the NASA JPEG isn't available
- No new JavaScript dependencies; geographic country labels are approximate and do not constitute precise boundary recognition

## Installation

Extract this ZIP to the current repository (same root as `frontend/` and `scripts/`). Run:

```powershell
.\backend\.venv\Scripts\python.exe .\scripts\enhance_earth_globe.py
.\backend\.venv\Scripts\python.exe .\scripts\download_nasa_earth_texture.py
node --test .\frontend\src\services\countryLabels.test.mjs
node --test .\frontend\src\services\globeMath.test.mjs
npm run build --prefix .\frontend
.\backend\.venv\Scripts\python.exe -m pytest backend -q
```

## Credits / data integrity

Earth texture: NASA Earth Observatory, Blue Marble Next Generation January 2004 global basemap. It is a **historical composite, not real-time Earth imagery**. The NASA daily data retrieved by the user's coordinate selections is separate and comes from NASA POWER.

Earth texture original source: https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/

Official JPEG download: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg

Country label locations: countryinfo global country metadata. Labels are approximate text anchors and may overlap or hide on smaller screens; **they are not accurate political boundaries**.

Do not overwrite untracked `README.txt`. Do not use `git add .` while other workstreams remain uncommitted.
