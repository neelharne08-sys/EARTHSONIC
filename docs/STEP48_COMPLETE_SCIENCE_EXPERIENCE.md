# Earthsonic — Step 48 Complete Science Experience

This package builds on the installed Step 47 NASA image-only Jukebox. It does not replace the NASA POWER scientific workstation, the Step 44–45 location comparison, FastAPI, SQLite, authentication, or locally downloaded NASA image files.

## The five enhancements

1. **Explain This Sound:** follows the active one of 100 horizontal image slices; shows normalized displayed brightness and the image-derived oscillator frequency. Uses `f = 180 + 580 × brightness` and never displays fake values when image analysis is unavailable.
2. **NASA Source Transparency:** links to the selected official NASA SVS source and the NASA POWER data portal, with explicit differences between rendered still-image pixels and daily meteorological measurements (`T2M`, `RH2M`, `WS2M`).
3. **Guided Demo Mode:** four manually advanced, keyboard-accessible steps; opens the NASA source, plays the image-scan audio from a user action, highlights the mapping, and scrolls to the existing scientific controls. It doesn't silently query the backend or claim automatic NASA climate loading.
4. **WAV Export:** generates a 16-kHz, 16-bit, mono WAV of the current station's 100-slice synthesized **image-scan oscillator**. This is not a NASA recording. It does not include narration, other mixer stems, or climate sound.
5. **Accessibility:** visible sound captions, opt-in screen-reader announcements at most once per 10 image slices, keyboard-operable controls, current values visible in the brightness chart, and reduced-motion styling.

## Installation

Use the existing feature branch; do not reset or switch away from uncommitted work. Extract ZIP directly into the repository root, not into `frontend` or another subfolder. Run:

```powershell
cd E:\SAHIL\nasa_spaceapps

Expand-Archive `
  -LiteralPath "E:\harshal\Earthsonic_Complete_Science_Enhancements_Step48.zip" `
  -DestinationPath "E:\SAHIL\nasa_spaceapps" `
  -Force

.\backend\.venv\Scripts\python.exe .\scripts\install_earthsonic_enhancements.py
```

The script requires the installed Step 47 image-only Jukebox. It backs up only the two existing source files being patched to `E:\SAHIL\earthsonic_step48_backups\<timestamp>`. It does not change any backend files, the database, data files, or `README.txt`. Running it twice is safe.

## Automated verification

```powershell
.\backend\.venv\Scripts\python.exe -m unittest discover -s scripts -p test_earthsonic_enhancements.py -v
node --test .\frontend\src\services\imageAudioExport.test.mjs
node --test .\frontend\src\services\nasaImageSonification.test.mjs
node --test .\frontend\src\services\climateComparison.test.mjs
npm run build --prefix .\frontend
.\backend\.venv\Scripts\python.exe -m pytest backend -q
git diff --check
git status -sb
```

## Browser acceptance test

Start the frontend and backend as previously, sign in, open Jukebox, and select the `SVS #4950` forest station.

- Verify `Explain This Sound` shows actual slice and pitch after image analysis has loaded.
- Press Start Guided Demo, follow all four steps, click Play the Image Sound, and open the scientific controls.
- Open both NASA source links.
- Download WAV; open the output in your regular audio player and hear the generated image-scan tones.
- Turn on text captions; optionally enable screen-reader updates and confirm they happen no more often than each 10-slice segment.
- Test Tab/Enter and seek via keyboard, plus mobile width and reduced-motion OS preferences.
- Switch stations; the export should change based on the new analyzed image.
- Verify NASA POWER and Two-location Climate Comparison continue to load and play independently.

## Engineering notes and scientific limits

The formula operates on per-image normalized *rendered RGB luminance*, not calibrated satellite instrument radiance. The browser Canvas analyzes a 100×70 pixel sample of a locally downloaded NASA SVS image, creating 100 position-based values. It does not recover the original physical measurements that were used to create the NASA visualization. Each image is normalized independently; sound pitches cannot be compared as absolute physical values across images.

The generated WAV is an offline approximation of the image-scan tone using a smoothed triangle oscillator. The live workstation may have additional audio stems, speech or master-volume effects, none of which are part of this export. The nominal scan duration is an artistic playback parameter, not a satellite observation time window.

The NASA POWER mode separately retrieves daily `T2M` °C, `RH2M` %, and `WS2M` m/s time series for selected coordinates and dates. Those measurements should not be described as coming from the still-image brightness scanner.

The installer intentionally leaves existing unrelated untracked files, including Step 46 experiments and old themes, untouched. Stage only intended Step 48 files once the browser is verified.
