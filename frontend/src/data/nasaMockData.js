/**
 * nasaMockData.js
 * Comprehensive NASA Earth Information Center (EIC) Sonification Data Configuration
 * Supports 4 Core Stations, Regional Callout Pins, Multi-Track Telemetry, & OpenCV JSON Hooks
 */

export const NASA_EIC_STATIONS = [
  {
    id: 'geos-aerosols',
    index: 1,
    title: 'GEOS Aerosols (Global Smoke, Dust & Sea Salt)',
    shortName: 'GEOS Aerosols',
    subtitle: 'Goddard Earth Observing System Forward Processing Model',
    category: 'Atmospheric Particulate Dynamics',
    accentColor: '#00f0ff',
    accentName: 'cyan',
    badge: 'Station 01 // Multi-Track',
    summary: 'Multi-track atmospheric particle sonification mapping optical depth across 4 distinct aerosol species: mineral dust, wildfire smoke, marine sea salt, and volcanic sulfates.',
    sonificationMethod: 'Multi-stem polyphonic pentatonic synthesis where optical thickness governs harmonic overtones, filter cutoffs, and acoustic density.',
    coordinates: { lat: 21.0, lon: 15.0 }, // Centered near Sahara
    metrics: {
      opticalDepthMax: '2.84 AOD',
      activeSpecies: 'Dust, Carbon, Sea Salt, SO4',
      globalResolution: '0.25° x 0.3125°',
      sensorArray: 'MODIS / VIIRS / GEOS-FP'
    },
    defaultLayers: [
      { id: 'dust', name: 'Dust Plume (Strings)', percentage: 45, color: '#f59e0b', defaultGain: 0.8 },
      { id: 'smoke', name: 'Biomass Smoke (Bass)', percentage: 28, color: '#ef4444', defaultGain: 0.7 },
      { id: 'seaSalt', name: 'Sea Salt (Shimmer)', percentage: 17, color: '#14b8a6', defaultGain: 0.6 },
      { id: 'sulfate', name: 'Sulfate / Lightning', percentage: 10, color: '#a855f7', defaultGain: 0.5 }
    ],
    videoFallback: 'https://images-assets.nasa.gov/video/GSFC_20180823_GEOS_Aerosols/GSFC_20180823_GEOS_Aerosols~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'iss-lightning',
    index: 2,
    title: 'ISS Lightning Events (2017–2023)',
    shortName: 'ISS Lightning',
    subtitle: 'Lightning Imaging Sensor on the International Space Station',
    category: 'Orbital Electromagnetic Transients',
    accentColor: '#f59e0b',
    accentName: 'amber',
    badge: 'Station 02 // Percussion',
    summary: 'High-contrast orbital flash detection mapping transient luminous events day and night across the Earth’s tropical and mid-latitude thunderstorm chimneys.',
    sonificationMethod: 'Algorithmic percussion triggers where optical irradiance translates to transient click attacks and kick velocity resonance.',
    coordinates: { lat: 21.1458, lon: 79.0882 }, // Nagpur / Central India lightning zone
    metrics: {
      flashDetectionRate: '566 fps (1.77 ms)',
      radiantEnergyPeak: '124.6 µJ/m²/sr',
      spatialFootprint: '4.0 km nadir',
      sensorArray: 'ISS-LIS High-speed CCD'
    },
    defaultLayers: [
      { id: 'transients', name: 'Flash Clicks', percentage: 50, color: '#f59e0b', defaultGain: 0.9 },
      { id: 'resonance', name: 'Radiant Boom', percentage: 30, color: '#f97316', defaultGain: 0.75 },
      { id: 'clusters', name: 'Storm Swarm', percentage: 20, color: '#eab308', defaultGain: 0.5 }
    ],
    videoFallback: 'https://images-assets.nasa.gov/video/NHQ_2019_0607_Lightning%20from%20Space/NHQ_2019_0607_Lightning%20from%20Space~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'night-lights',
    index: 3,
    title: 'Change in Night Lights (2012–2023)',
    shortName: 'Night Lights',
    subtitle: 'Suomi NPP VIIRS Day/Night Band Decadal Transition',
    category: 'Anthropogenic Illumination Delta',
    accentColor: '#10b981',
    accentName: 'emerald',
    badge: 'Station 03 // Bass & Arp',
    summary: 'Decadal longitudinal tracking of nighttime anthropogenic emissions revealing infrastructure expansion, rural electrification, and energy grid shifts.',
    sonificationMethod: 'Harmonic pitch & tempo modulation where regional luminance governs baseline sub-bass and growth gradients drive pentatonic arpeggio rhythms.',
    coordinates: { lat: 29.7604, lon: -95.3698 }, // Houston / Gulf Coast
    metrics: {
      radianceThreshold: '0.5 - 1000 nW/cm²/sr',
      temporalBaseline: '2012 - 2023 Longitudinal',
      spatialResolution: '750m Panchromatic',
      sensorArray: 'VIIRS Day/Night Band'
    },
    defaultLayers: [
      { id: 'urbanCore', name: 'Urban Sub-Bass', percentage: 55, color: '#10b981', defaultGain: 0.85 },
      { id: 'suburbanArp', name: 'Grid Arpeggio', percentage: 30, color: '#14b8a6', defaultGain: 0.7 },
      { id: 'darkSky', name: 'Dark Sky Filter', percentage: 15, color: '#064e3b', defaultGain: 0.4 }
    ],
    videoFallback: 'https://images-assets.nasa.gov/video/Earth%20at%20Night/Earth%20at%20Night~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'ocean-currents',
    index: 4,
    title: 'Perpetual Ocean & Sea Surface Currents',
    shortName: 'Ocean Currents',
    subtitle: 'ECCO2 Global Ocean Physical & Thermal Flow Model',
    category: 'Hydrodynamic Thermohaline Circulation',
    accentColor: '#38bdf8',
    accentName: 'sky',
    badge: 'Station 04 // Ambient Waves',
    summary: 'Mesoscale ocean eddy circulation and sea-surface thermal gradients sonified into fluid, undulating binaural ambient waveforms and harmonic wave swells.',
    sonificationMethod: 'Continuous phase modulation and low-pass filter sweeps guided by rotational kinetic energy and ocean velocity vectors.',
    coordinates: { lat: -3.4653, lon: -62.2159 }, // South Atlantic & Amazon runoff
    metrics: {
      currentVelocityMax: '2.4 m/s (Gulf Stream)',
      depthLevels: '50 vertical levels',
      modelFramework: 'Estimating the Circulation and Climate of the Ocean (ECCO2)',
      sensorArray: 'Jason-3 / Sentinel-6 / Argo Drifters'
    },
    defaultLayers: [
      { id: 'deepCurrent', name: 'Deep Thermohaline', percentage: 40, color: '#0284c7', defaultGain: 0.8 },
      { id: 'eddySwell', name: 'Mesoscale Swell', percentage: 35, color: '#38bdf8', defaultGain: 0.65 },
      { id: 'thermalWash', name: 'Surface Thermal Wash', percentage: 25, color: '#93c5fd', defaultGain: 0.5 }
    ],
    videoFallback: 'https://images-assets.nasa.gov/video/GSFC_20120320_PerpetualOcean/GSFC_20120320_PerpetualOcean~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  }
];

// Interactive Regional Callouts on the Right/Center Globe
export const REGIONAL_CALLOUTS = [
  {
    id: 'nagpur-india',
    name: 'Nagpur / Central India',
    coordinates: { x: 70, y: 44 }, // Percentage on 2D map projection or globe
    lat: '21.14° N',
    lon: '79.08° E',
    primaryStation: 'iss-lightning',
    accent: '#f59e0b',
    phenomenon: 'Intense Monsoon Lightning Corridors & Aerosol Confluence',
    telemetry: {
      aodValue: '0.62 PM2.5',
      lightningDensity: '48.2 flashes/km²/yr',
      urbanLuminance: '42.5 nW/cm²/sr',
      acousticProfile: 'Polyrhythmic transient percussion & mid-frequency drone'
    },
    soundNote: 'E4 Pentatonic Kinetic Strike'
  },
  {
    id: 'sahara-plume',
    name: 'Sahara Dust Plume',
    coordinates: { x: 44, y: 38 },
    lat: '23.80° N',
    lon: '11.20° E',
    primaryStation: 'geos-aerosols',
    accent: '#00f0ff',
    phenomenon: 'Trans-Atlantic Mineral Dust Super-Highway',
    telemetry: {
      aodValue: '2.45 AOD (Peak)',
      lightningDensity: '1.2 flashes/km²/yr',
      urbanLuminance: '0.8 nW/cm²/sr',
      acousticProfile: 'Deep sub-octave fundamental C2 drone with resonant sweeps'
    },
    soundNote: 'C2 Sub-Harmonic Pad'
  },
  {
    id: 'amazon-basin',
    name: 'Amazon River Basin',
    coordinates: { x: 32, y: 56 },
    lat: '3.46° S',
    lon: '62.21° W',
    primaryStation: 'geos-aerosols',
    accent: '#10b981',
    phenomenon: 'Biomass Burning Season & Evapotranspiration Corridor',
    telemetry: {
      aodValue: '1.18 AOD',
      lightningDensity: '32.6 flashes/km²/yr',
      urbanLuminance: '3.1 nW/cm²/sr',
      acousticProfile: 'Warm analog saw chords (G3-A3) & filtered noise rustle'
    },
    soundNote: 'G3 Warm Saw Chord'
  },
  {
    id: 'houston-gulf',
    name: 'Houston / Gulf Coast',
    coordinates: { x: 23, y: 35 },
    lat: '29.76° N',
    lon: '95.36° W',
    primaryStation: 'night-lights',
    accent: '#38bdf8',
    phenomenon: 'Petrochemical Night Light Corridor & Coastal Maritime Humidity',
    telemetry: {
      aodValue: '0.34 AOD',
      lightningDensity: '18.4 flashes/km²/yr',
      urbanLuminance: '89.4 nW/cm²/sr',
      acousticProfile: 'Ascending pentatonic sequence (C4-D4-E4-G4) with sub-bass kick'
    },
    soundNote: 'C4 Arpeggiated Pulse'
  }
];

// Real-time Dual-Series Telemetry (Series 1: NASA Pixel Intensity vs. Series 2: Audio Frequency Hz)
export const MULTI_BAND_SPECTRUM_DATA = [
  { band: '01', label: '60 Hz', pixelIntensity: 38, audioFreqHz: 42 },
  { band: '02', label: '120 Hz', pixelIntensity: 65, audioFreqHz: 74 },
  { band: '03', label: '250 Hz', pixelIntensity: 82, audioFreqHz: 79 },
  { band: '04', label: '500 Hz', pixelIntensity: 94, audioFreqHz: 91 },
  { band: '05', label: '1 kHz', pixelIntensity: 71, audioFreqHz: 68 },
  { band: '06', label: '2 kHz', pixelIntensity: 56, audioFreqHz: 62 },
  { band: '07', label: '4 kHz', pixelIntensity: 43, audioFreqHz: 50 },
  { band: '08', label: '8 kHz', pixelIntensity: 28, audioFreqHz: 35 },
];

// Donut Breakdown percentages
export const ACOUSTIC_LAYER_BREAKDOWN = [
  { name: 'Dust Particles', percentage: 45, color: '#f59e0b', track: 'Track 1: Dust Strings' },
  { name: 'Biomass Smoke', percentage: 28, color: '#ef4444', track: 'Track 2: Smoke Bass Synth' },
  { name: 'Sulfate / Sea Salt', percentage: 17, color: '#14b8a6', track: 'Track 4: Night Lights Arp' },
  { name: 'Lightning Transients', percentage: 10, color: '#00f0ff', track: 'Track 3: ISS Lightning Percussion' },
];

// Temporal Dual-Spline Waveform Points
export const TEMPORAL_WAVEFORM_POINTS = Array.from({ length: 28 }, (_, i) => {
  const t = i * 0.5;
  const luminosityIndex = Math.round(50 + 35 * Math.sin(t * 0.4) + 12 * Math.cos(t * 0.8));
  const harmonicPitchMod = Math.round(45 + 30 * Math.sin(t * 0.45 + 1.2) + 15 * Math.cos(t * 0.25));
  return {
    time: `${(i * 1.5).toFixed(1)}s`,
    luminosityIndex: Math.max(15, Math.min(98, luminosityIndex)),
    harmonicPitchMod: Math.max(18, Math.min(95, harmonicPitchMod)),
  };
});
