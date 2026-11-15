# Earthsonic NASA Climate Symphony — Step 35

Adds NASA POWER daily `T2M` (temperature), `RH2M` (relative humidity), and `WS2M` (wind speed) as one time-aligned dataset with three generated sound layers. Uses existing NASA POWER urllib caching, date validation, and temperature pitch mapping. Missing measurements stay null and silent, and each voice has its own independently labeled mapping.

## Install

From `E:\SAHIL\nasa_spaceapps` on your newly created `feature/nasa-climate-trio` branch:

```powershell
Expand-Archive -LiteralPath "E:\harshal\Earthsonic_NASA_Climate_Step35.zip" -DestinationPath "E:\SAHIL\nasa_spaceapps" -Force
.\backend\.venv\Scripts\python.exe .\scripts\integrate_nasa_climate.py
.\backend\.venv\Scripts\python.exe -m pytest backend\test_nasa_climate.py -q
.\backend\.venv\Scripts\python.exe -m pytest backend -q
npm run build --prefix .\frontend
```

## Verify

Use `GET /api/science/climate?latitude=21.1458&longitude=79.0882&start=20250101&end=20250107` while backend is running. In My Space open the multi-layer science section and play the Climate Symphony. The original temperature lab remains untouched.

## Mapping

- T2M (°C): -20..50 to 220..880 Hz, sine wave
- RH2M (%): 0..100 to 110..440 Hz, triangle wave
- WS2M (m/s): 0..20 to 80..320 Hz, sine wave

All pitch mappings are artistic. POWER data are modeled/gridded environmental measurements, not local instrument recordings. Values outside artistic pitch ranges are clamped; no invented values are substituted for missing data.
