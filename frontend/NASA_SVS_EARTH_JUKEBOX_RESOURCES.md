# NASA SVS Earth Information Jukebox — Master Resource & Architecture Blueprint

**2026 NASA International Space Apps Challenge • The Earth Information Jukebox**  
*Visual Theme:* **Space Blue & Earthy Planetary Aesthetic** (Deep Space Navy `#080E1E`, NASA Blue `#0B3D91`, Atmospheric Cyan `#00E5FF`, Coastal Teal `#14B8A6`, and Biosphere Emerald `#10B981` — moving away from flat black to a vibrant living planetary theme).

---

## 1. Font & Typography Specification

Typography is delivered in **Google Fonts WOFF2 format** paired with Tailwind CSS utility classes to load without local font file errors:

| UI Role | Font Family | Delivery Format | Tailwind / CSS Utility Class |
|---|---|---|---|
| **Hero & HUD Headers** | **Orbitron** (600–900) | Google Fonts WOFF2 | `font-display uppercase tracking-hud tracking-[0.22em]` |
| **UI Cards, Body & Controls** | **Plus Jakarta Sans** (400–700) | Google Fonts WOFF2 | `font-sans font-semibold text-slate-100` |
| **Telemetry, Hz & Time-Lock** | **JetBrains Mono** (400–700) | Google Fonts WOFF2 | `font-mono tabular-nums text-earth-cyan` |
| **Display Accents** | **Space Grotesk** (500–700) | Google Fonts WOFF2 | `font-display tracking-tight text-white` |

### Web Embed Code (HTML `<head>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

---

## 2. All 10 Official NASA SVS Sources (Videos, Visuals, Voices & Audio Stems)

### Source 01: SVS #4950 — GEDI Forest Height (ISS LiDAR 3D Canopy)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/4950/](http://svs.gsfc.nasa.gov/4950/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20181129_GEDI_Canopy/GSFC_20181129_GEDI_Canopy~orig.mp4`
- **Direct Visual Asset**: `GEDI_global_w_colorbar_1080p60.mp4` / `GEDI_global_w_colorbar_0900_print.jpg`
- **Voice & Sound Mapping**: **Voice 1 (Harp & Woodwind)**
  - *Description*: Canopy height (0–50m) drives pentatonic harp arpeggios (110–880 Hz) and warm woodwind harmonics.
  - *Spoken Voiceover*: Spoken tree canopy height announcements for accessibility.
- **Mixer Stems**:
  - `Canopy Harp Arpeggio` (0–50m pitch sweep)
  - `Woodwind Biomass Body` (Forest density volume)
  - `Sub-Canopy Ground Bed` (LiDAR ground return thump)

---

### Source 02: SVS #4960 — 3D Atmospheric River (MERRA-2 Model)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/4960/](http://svs.gsfc.nasa.gov/4960/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20170417_Atmos_Rivers/GSFC_20170417_Atmos_Rivers~orig.mp4`
- **Direct Visual Asset**: `atmos_rivers_narrated_HD.mp4` / `atmos_rivers_narrated_HD.webm`
- **Voice & Sound Mapping**: **Voice 2 (Native NASA Narration + Rain Pad)**
  - *Description*: Moisture transport density governs a resonant wind/rain low-pass filter sweep (65 Hz–2.4 kHz) layered with spoken scientific voiceover.
- **Mixer Stems**:
  - `Moisture Rain Pad` (Ambient humidity bed)
  - `Vapor Transport Sweep` (IVT density filter sweep)
  - `High-Altitude Wind Shimmer` (Jet stream noise wash)

---

### Source 03: SVS #5011 — ISS Lightning Events (2017–2023 LIS Sensor)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/5011/](http://svs.gsfc.nasa.gov/5011/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/NHQ_2019_0607_Lightning%20from%20Space/NHQ_2019_0607_Lightning%20from%20Space~orig.mp4`
- **Direct Visual Asset**: `iss_lightning_sphere_07312023.mp4` / `iss_lightning_preview.jpg`
- **Voice & Sound Mapping**: **Voice 3 (Orbital Percussion)**
  - *Description*: White/violet optical flash contours trigger crisp marimba transients and electronic snare/sub-kick hits.
- **Mixer Stems**:
  - `Marimba Flash Strikes` (Transient optical trigger)
  - `Radiant Sub-Kick Boom` (Irradiance velocity 45–150 Hz)
  - `Cloud Cluster Shimmer` (Swarm density noise)

---

### Source 04: SVS #5196 — DYAMOND Global Carbon Dioxide (CO2 ppm)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/5196/](http://svs.gsfc.nasa.gov/5196/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20161213_CO2_Breathing/GSFC_20161213_CO2_Breathing~orig.mp4`
- **Direct Visual Asset**: `dyamondPointCloud_12-1-2023b_dyamond_co2_anim_globe_orbit_1080p30_h265.mp4`
- **Voice & Sound Mapping**: **Voice 4 (Breathing Sub-Bass)**
  - *Description*: Day/night planetary CO2 respiration drives a rhythmic 65–220 Hz LFO sub-bass pulse.
- **Mixer Stems**:
  - `Respiration Sub-Bass` (Diurnal breathing wave)
  - `Anthropogenic Saw Pulse` (Urban emission spikes)
  - `Deep Oceanic Sink Pad` (Atmospheric absorption bed)

---

### Source 05: SVS #5425 — Perpetual Ocean 2 (Western Boundary Currents)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/5425/](http://svs.gsfc.nasa.gov/5425/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20120320_PerpetualOcean/GSFC_20120320_PerpetualOcean~orig.mp4`
- **Direct Visual Asset**: `perpetual_ocean2_CLOSE_095_beauty_600m_and_below.14000_print.jpg`
- **Voice & Sound Mapping**: **Voice 5 (Stereo Strings)**
  - *Description*: Surface 0–600m white flows pan stereo violin arpeggios; >600m deep cyan flows drive resonant cello and double bass lines.
- **Mixer Stems**:
  - `Surface Violin Arpeggios` (Kinetic current flow)
  - `Abyssal Cello Drone` (Deep thermohaline circulation)
  - `Eddy Swell Modulator` (Mesoscale vortex oscillation)

---

### Source 06: SVS #5533 — Air Quality Model Runs (GEOS-CF Pollutants)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/5533/](http://svs.gsfc.nasa.gov/5533/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20180823_GEOS_Aerosols/GSFC_20180823_GEOS_Aerosols~orig.mp4`
- **Direct Visual Asset**: `AirQuality_WithLabels_5760x3240_0929.png` (PM2.5, O3, CO, NOx)
- **Voice & Sound Mapping**: **Voice 6 (4-Stem Synth Choir)**
  - *Description*: Individual vocal formant synthesizers for PM2.5, Ozone, Carbon Monoxide, and NOx with spoken urban air-quality threshold alerts.
- **Mixer Stems**:
  - `PM2.5 Particulate Tenor` (Fine particle choir voice)
  - `Ozone Soprano Resonator` (O3 photochemical smog voice)
  - `Carbon Monoxide Bass` (Combustion drone)
  - `Nitrogen Dioxide Alto` (Vehicle exhaust formant)

---

### Source 07: SVS #5669 — GEOS Aerosols (2025) (Smoke, Dust, Salt, Sulfate)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/5669/](http://svs.gsfc.nasa.gov/5669/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20180823_GEOS_Aerosols/GSFC_20180823_GEOS_Aerosols~orig.mp4`
- **Direct Visual Asset**: `Aerosols_EarthRotating_1920x1080.mp4` / `Aerosols_2025-08-19T20_00_00_5760x3240.png`
- **Voice & Sound Mapping**: **Voice 7 (4-Track Ensemble)**
  - *Description*: Blue Sea Salt = Deep Bass; Pink Dust = Viola; Orange Smoke = Sawtooth Lead; Green Sulfate = Crystalline Bell.
- **Mixer Stems**:
  - `Blue Sea Salt Sub-Bass` (Ocean spray fundamentals)
  - `Pink Dust Viola` (Saharan dust plume chords)
  - `Orange Smoke Saw Lead` (Wildfire carbon arpeggio)
  - `Green Sulfate Bell Chime` (Volcanic emission accents)

---

### Source 08: SVS #3912 — Global Sea Surface Currents & Temp (ECCO2)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/3912/](http://svs.gsfc.nasa.gov/3912/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20120320_PerpetualOcean/GSFC_20120320_PerpetualOcean~orig.mp4`
- **Direct Visual Asset**: `flat_global_ecco2_2028x1024.25000.jpg` (2007–2008 thermal flow)
- **Voice & Sound Mapping**: **Voice 8 (Thermal FM Rhodes)**
  - *Description*: Warm red currents (>26°C) trigger major-pentatonic FM electric piano chords; cold blue polar currents (<4°C) play deep sub drones.
- **Mixer Stems**:
  - `Thermal FM Rhodes Chords` (Equatorial warmth harmony)
  - `Polar Cold Sub Drone` (Deep Arctic/Antarctic current)
  - `Thermal Gradient Chorus` (Transition boundary sweep)

---

### Source 09: SVS #5313 — Change in Night Lights 2012–2023 (EIC India Zoom)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/5313/](http://svs.gsfc.nasa.gov/5313/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/Earth%20at%20Night/Earth%20at%20Night~orig.mp4`
- **Direct Visual Asset**: `nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4`
- **Voice & Sound Mapping**: **Voice 9 (Urban Arpeggiator)**
  - *Description*: Purple brightening electrification zones (India pop-out) raise tempo from 90 to 140 BPM; orange dimming slows tempo.
- **Mixer Stems**:
  - `Urban Tempo Arpeggiator` (90–140 BPM grid sequence)
  - `Sub-Bass Luminance Wave` (City core fundamental)
  - `Electrification Clock Pulse` (Decadal transition beat)

---

### Source 10: SVS #13786 — Data Sonification: Caldwell 73 (Hubble Reference)
- **Official NASA SVS Link**: [http://svs.gsfc.nasa.gov/13786/](http://svs.gsfc.nasa.gov/13786/)
- **Direct Video Stream**: `https://images-assets.nasa.gov/video/GSFC_20200922_Hubble_Sonification/GSFC_20200922_Hubble_Sonification~orig.mp4`
- **Direct Visual Asset**: `https://svs.gsfc.nasa.gov/vis/a010000/a013700/a013786/wide.jpg`
- **Voice & Sound Mapping**: **Voice 10 (NASA Reference Mode)**
  - *Description*: Benchmark NASA sonification: Vocal choir pad for mid-range stars, warm marimba for red/orange pixels, and crystalline glockenspiel for bright blue stars.
- **Mixer Stems**:
  - `Hubble Choir Pad` (Radial cluster harmony)
  - `Red/Orange Pixel Marimba` (Warm star velocity hits)
  - `Blue Pixel Glockenspiel` (High-energy star chimes)

---

## 3. Web Audio API Voices & Spoken Accessibility Architecture

### Web Audio Multi-Voice Synthesizer ([`src/services/audioEngine.js`](file:///c:/Users/NEEL/Desktop/Vertex/src/services/audioEngine.js))
- Generates real-time sound in the browser without requiring external audio files.
- Uses pentatonic frequency intervals across octaves C2 through C6 to guarantee harmonious soundscapes.
- Incorporates a master Dynamics Compressor (`threshold: -18dB`, `ratio: 8:1`) and real-time FFT Analyser.
- Supports per-track stem isolation, volume faders, and muting.

### Spoken Accessibility Voices (`window.speechSynthesis`)
- Dedicated **NASA Voiceover Guide** toggle in the user interface.
- Reads aloud station summaries, scientific instruments, regional indices (such as Nagpur, Saharan Dust, and Amazon Basin), and air-quality thresholds for blind and low-vision users.
