# Earthsonic NASA POWER Science Lab · Step 34

1. Extract this archive into the root of `E:\SAHIL\nasa_spaceapps`.
2. Run `python scripts/integrate_nasa_power.py` using the project venv.
3. Run `python -m pytest backend/test_nasa_power.py -q` using the project venv.
4. Run `python -m pytest backend -q` using the project venv.
5. Build the frontend: `npm run build --prefix .\frontend`.
6. Run the FastAPI backend on port 8000 and Vite on port 5173 or 5174.
7. Sign in, open My Space, and use the NASA POWER Science Lab.

Endpoint: `GET /api/science/temperature?latitude=0&longitude=0&start=20250101&end=20250114`.

Source: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

Data: daily 2-meter air temperature (T2M), degrees Celsius, as supplied by NASA POWER gridded meteorological analyses/reanalysis, not an in-situ station thermometer measurement. Time standard: UTC.

Music mapping: 220 Hz at -20 C to 880 Hz at +50 C, logarithmic pitch mapping with clipping outside range. This is an Earthsonic-designed artistic mapping, not a NASA-recorded sound.

The backend uses an in-process cache to avoid repeated calls for identical requests. Automated tests mock NASA's API and do not require network access. Live browser data retrieval requires an internet connection on the backend host.
