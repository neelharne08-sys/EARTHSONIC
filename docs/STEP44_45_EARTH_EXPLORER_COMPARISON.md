# Earthsonic — Steps 44 & 45: Earth Explorer and Two-Location Climate Comparison

## Purpose
Enable signed-in users to choose two distinct Earth locations, load a shared 1–31-day NASA POWER period, compare daily temperature (`T2M`), relative humidity (`RH2M`) and wind (`WS2M`), view charts and statistics, download a CSV, and listen to both location-specific climate sonifications in sequence.

## Existing systems preserved
No changes to Python, FastAPI, NASA POWER HTTP handlers, SQLite schema, session authentication, saved mixes, favorites or the globe's rendering implementation. The comparison uses `GET /api/science/climate`, existing GlobeLocationPicker and existing Web Audio scheduler.

## Limitations and transparent science attribution
NASA POWER provides gridded meteorological analyses/reanalysis at the selected coordinates. It does **not** provide directly recorded sound, and it is not an on-site weather observation. Earthsonic applies artistic pitch mappings to NASA numeric values. The ten NASA SVS visual stations are independent, not claimed to be the source of these climate samples. Missing measurements remain missing, are excluded from means, and create gaps in charts. A/B comparisons use the same requested UTC date range. The summary delta is mean(A) minus mean(B), calculated using each location's available numeric days; the valid-day counts are displayed.

## Features
- Select location A and B using searchable, explicitly defined example cities or the existing interactive 3D-style globe.
- NASA POWER API requests for both locations in parallel with session cookies (`credentials: include`).
- Shared date range with input validation.
- Average measurements and their differences, one trend plot per variable, daily data table, CSV export.
- Play synthesized temperature, humidity and wind for A or B; initiating comparison audio stops homepage Scientific Jukebox audio and vice versa. Never claims the sounds were recorded by NASA.
- Guest-facing teaser offers sign-in rather than unrestricted NASA API access.
- Responsive styling and reduced-motion support.

## Installation
First commit and push the locally verified Step 43 redesign on `feature/experience-redesign`. Then create a new branch `feature/earth-climate-compare`. Extract this ZIP to the repository root (new files are placed directly), run `scripts/install_climate_comparison.py` with the project's backend virtual environment and run tests.

## Verify
```powershell
.\backend\.venv\Scripts\python.exe -m unittest discover -s scripts -p test_climate_comparison_installer.py -v
node --test .\frontend\src\services\climateComparison.test.mjs
npm run build --prefix .\frontend
.\backend\.venv\Scripts\python.exe -m pytest backend -q
git diff --check
git status -sb
```

## Browser acceptance testing
1. Open homepage as guest. Comparison prompts sign-in and does not call NASA API.
2. Sign in; see A=Nagpur and B=Tokyo.
3. Change locations using presets and globe, including a country-name region.
4. Load 7 daily dates: both sources must be NASA POWER, not simulated.
5. Switch chart variables, expand daily values, export CSV.
6. Play A, switch to B: only one comparison audio player stays active; switch to main Scientific Jukebox: comparison audio stops.
7. Try invalid date spans (>31 days), invalid region, and expired session. Confirm informative errors and no fake values.
8. Check browser sizes 375px and 1280px, keyboard controls and reduced-motion preferences.

## Relevant files
- `frontend/src/components/ClimateComparison.jsx`
- `frontend/src/components/ClimateComparison.css`
- `frontend/src/services/climateComparison.mjs`
- `frontend/src/services/climateComparison.test.mjs`
- `frontend/src/pages/Home.jsx` (patched after installation)
- `scripts/install_climate_comparison.py`
- `scripts/test_climate_comparison_installer.py`

## Known design constraints
- City search searches the bundled **preset city names**, not all world addresses. The globe can select any lat/long point.
- The globe provides Earth imagery and coordinates, not authoritative reverse-geocoded country names.
- Export is CSV only; audio export and comparison save-to-profile are planned separately.
- No claims of live weather or real-time instrument measurements.
