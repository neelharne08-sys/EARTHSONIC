/**
 * stations.js
 * Comprehensive 10 Official NASA SVS Stations for EARTHSONIC
 * NASA Space Apps Challenge 2026 - The Earth Information Jukebox
 */

export const STATIONS = [
  {
    id: 'svs-4950',
    svsId: 'SVS #4950',
    priority: 1,
    title: 'GEDI Forest Height (3D LiDAR Canopy)',
    shortName: 'GEDI Forest Canopy',
    subtitle: 'Global Ecosystem Dynamics Investigation on ISS',
    category: 'Biosphere & Canopy Structure',
    accentColor: '#71717A',
    accentClass: 'emerald',
    badgeText: 'SVS #4950 • Voice 1 (Harp & Woodwind)',
    svsUrl: 'http://svs.gsfc.nasa.gov/4950/',
    videoAsset: 'GEDI_global_w_colorbar_1080p60.mp4',
    visualAsset: 'GEDI_global_w_colorbar_0900_print.jpg',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004950/GEDI_global_w_colorbar_1080p60.mp4',
    thumbnail: '/nasa-stills/svs-4950.jpg',
    description: 'High-resolution LiDAR cross-section scanning 3D vertical canopy heights (0–50m) across the planet’s tropical and temperate forest biospheres.',
    voiceName: 'Voice 1 (Harp & Woodwind)',
    sonificationApproach: 'Canopy height (0–50m) drives pentatonic harp arpeggios (110–880 Hz) and woodwind harmonics alongside spoken canopy height announcements.',
    displayMode: 'LiDAR Visualizer + Harp & Woodwind Stems',
    soundMapping: [
      { data: 'Canopy Height (0-50m)', sound: 'Pentatonic pitch ascent (110–880 Hz)', type: 'Melodic Arp' },
      { data: 'Biomass Density Index', sound: 'Warm woodwind vibrato & resonant body', type: 'Mid Harmony' },
      { data: 'Ground Elevation Echo', sound: 'Soft low-frequency acoustic thud', type: 'Bass Thump' }
    ],
    telemetry: {
      instrument: 'GEDI 3-Laser 8-Beam LiDAR',
      range: '0 to 52.4 meters tree height',
      platform: 'International Space Station (ISS JEM-EF)',
      spectralHz: '110 Hz – 880 Hz'
    },
    tracks: [
      { id: 'harp', name: 'Canopy Harp Arpeggio', defaultVolume: 85, enabled: true, color: '#71717A' },
      { id: 'woodwind', name: 'Woodwind Biomass Body', defaultVolume: 75, enabled: true, color: '#71717A' },
      { id: 'ground', name: 'Sub-Canopy Ground Bed', defaultVolume: 60, enabled: true, color: '#71717A' }
    ]
  },
  {
    id: 'svs-4960',
    svsId: 'SVS #4960',
    priority: 2,
    title: '3D Atmospheric River (MERRA-2 Model)',
    shortName: '3D Atmospheric River',
    subtitle: 'Goddard MERRA-2 Global Hydrological Flow',
    category: 'Vapor Transport & Moisture Density',
    accentColor: '#0B3D91',
    accentClass: 'cyan',
    badgeText: 'SVS #4960 • Voice 2 (Native NASA Narration + Rain Pad)',
    svsUrl: 'http://svs.gsfc.nasa.gov/4960/',
    videoAsset: 'atmos_rivers_narrated_HD.mp4',
    visualAsset: 'atmos_rivers_narrated_HD.webm',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004960/atmos_rivers_narrated_HD.webm',
    thumbnail: '/nasa-stills/svs-4960.jpg',
    description: 'Narrow, concentrated corridors of intense water vapor transport carrying equivalent volumes of water greater than the Amazon River outlet into global storm belts.',
    voiceName: 'Voice 2 (Native NASA Narration + Rain Pad)',
    sonificationApproach: 'Moisture density controls a resonant wind/rain low-pass filter sweep layered over ambient atmospheric pads and NASA spoken scientific narrative.',
    displayMode: 'Vapor Corridor Video + Rain Pad Stems',
    soundMapping: [
      { data: 'Integrated Vapor Transport', sound: 'Moisture density wind/rain filter sweep (65 Hz–2.4 kHz)', type: 'Filter Sweep' },
      { data: 'Jet Stream Velocity', sound: 'Ambient choir drone with subtle tremolo', type: 'Atmospheric Bed' },
      { data: 'Precipitation Core', sound: 'Filtered white-noise rain texture', type: 'Noise Wash' }
    ],
    telemetry: {
      instrument: 'MERRA-2 High-Resolution Assimilation',
      fluxRate: '750+ kg/m/s IVT plume',
      platform: 'NASA Goddard Space Flight Center',
      spectralHz: '65 Hz – 2.4 kHz'
    },
    tracks: [
      { id: 'rainPad', name: 'Moisture Rain Pad', defaultVolume: 80, enabled: true, color: '#0B3D91' },
      { id: 'vaporSweep', name: 'Vapor Transport Sweep', defaultVolume: 70, enabled: true, color: '#0B3D91' },
      { id: 'windNoise', name: 'High-Altitude Wind Shimmer', defaultVolume: 55, enabled: true, color: '#0B3D91' }
    ]
  },
  {
    id: 'svs-5011',
    svsId: 'SVS #5011',
    priority: 3,
    title: 'ISS Lightning Events (2017–2023 LIS)',
    shortName: 'ISS Lightning Events',
    subtitle: 'Lightning Imaging Sensor on the International Space Station',
    category: 'Electromagnetic Optical Transients',
    accentColor: '#D97706',
    accentClass: 'amber',
    badgeText: 'SVS #5011 • Voice 3 (Orbital Percussion)',
    svsUrl: 'http://svs.gsfc.nasa.gov/5011/',
    videoAsset: 'iss_lightning_sphere_07312023.mp4',
    visualAsset: 'iss_lightning_preview.jpg',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005011/iss_lightning_sphere_07312023.mp4',
    thumbnail: '/nasa-stills/svs-5011.jpg',
    description: 'High-speed optical flash detection of lightning pulses day and night across the tropics, capturing radiant energy pulses and lightning chimneys.',
    voiceName: 'Voice 3 (Orbital Percussion)',
    sonificationApproach: 'White/violet flash contours trigger crisp marimba transients and electronic snare/kick hits scaled to flash radiant microjoules.',
    displayMode: 'Transient Flash Video + Percussion Engine',
    soundMapping: [
      { data: 'Flash Timestamp', sound: 'Crisp marimba transient & rimshot attack', type: 'Kinetic Click' },
      { data: 'Radiant Optical Energy', sound: 'Velocity-scaled sub-kick resonance (45–150 Hz)', type: 'Sub Punch' },
      { data: 'Cluster Swarm Density', sound: 'Polyrhythmic marimba rolls', type: 'Density Swarm' }
    ],
    telemetry: {
      instrument: 'ISS-LIS High-speed CCD Focal Plane',
      frameRate: '566 frames/second (1.77 ms)',
      radiancePeak: '124.6 µJ/m²/sr',
      platform: 'International Space Station'
    },
    tracks: [
      { id: 'marimbaHits', name: 'Marimba Flash Strikes', defaultVolume: 90, enabled: true, color: '#D97706' },
      { id: 'subKick', name: 'Radiant Sub-Kick Boom', defaultVolume: 80, enabled: true, color: '#D97706' },
      { id: 'stormHiss', name: 'Cloud Cluster Shimmer', defaultVolume: 50, enabled: true, color: '#D97706' }
    ]
  },
  {
    id: 'svs-5196',
    svsId: 'SVS #5196',
    priority: 4,
    title: 'DYAMOND Global Carbon Dioxide (CO2 ppm)',
    shortName: 'DYAMOND CO2 ppm',
    subtitle: 'Global High-Resolution Atmospheric CO2 Simulation',
    category: 'Biogeochemical Respiration',
    accentColor: '#FC3D21',
    accentClass: 'red',
    badgeText: 'SVS #5196 • Voice 4 (Breathing Sub-Bass)',
    svsUrl: 'http://svs.gsfc.nasa.gov/5196/',
    videoAsset: 'dyamondPointCloud_12-1-2023b_dyamond_co2_anim_globe_orbit_1080p30_h265.mp4',
    visualAsset: 'dyamond_co2_still.jpg',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005196/dyamondPointCloud_3-29-2023a_dyamond_co2_anim_globe_zoom_1080p30.mp4',
    thumbnail: '/nasa-stills/svs-5196.jpg',
    description: 'High-resolution simulation visualizing the diurnal heartbeat of planetary CO2 respiration: daytime photosynthesis drawdown and nighttime release.',
    voiceName: 'Voice 4 (Breathing Sub-Bass)',
    sonificationApproach: 'Day/night CO2 respiration pulsing drives a rhythmic 65–220 Hz LFO sub-bass fundamental wave that breathes in sync with planetary biology.',
    displayMode: 'CO2 Orbit Video + Resonant Sub-Bass Stems',
    soundMapping: [
      { data: 'Diurnal CO2 Respiration', sound: 'Rhythmic 65–220 Hz breathing LFO bass pulse', type: 'Breathing Bass' },
      { data: 'Urban Plume Concentrations', sound: 'Harmonic saturation & saw overtones', type: 'Overdrive Mid' },
      { data: 'Oceanic CO2 Sink', sound: 'Sub-octave low-pass drone', type: 'Sub Bed' }
    ],
    telemetry: {
      instrument: 'DYAMOND Model Assimilated with OCO-2',
      ppmRange: '395 to 424 ppm CO2',
      resolution: 'Global Ultra-High Resolution',
      platform: 'Orbiting Carbon Observatory-2'
    },
    tracks: [
      { id: 'breathingBass', name: 'Respiration Sub-Bass', defaultVolume: 85, enabled: true, color: '#FC3D21' },
      { id: 'emissionPulse', name: 'Anthropogenic Saw Pulse', defaultVolume: 70, enabled: true, color: '#FC3D21' },
      { id: 'oceanSink', name: 'Deep Oceanic Sink Pad', defaultVolume: 60, enabled: true, color: '#FC3D21' }
    ]
  },
  {
    id: 'svs-5425',
    svsId: 'SVS #5425',
    priority: 5,
    title: 'Perpetual Ocean 2 (Western Boundary Currents)',
    shortName: 'Perpetual Ocean 2',
    subtitle: 'High-Resolution Global Ocean Circulation Model',
    category: 'Hydrodynamics & Ocean Eddies',
    accentColor: '#0B3D91',
    accentClass: 'blue',
    badgeText: 'SVS #5425 • Voice 5 (Stereo Strings)',
    svsUrl: 'http://svs.gsfc.nasa.gov/5425/',
    videoAsset: 'perpetual_ocean2_CLOSE_095_beauty_600m_and_below.14000_print.jpg',
    visualAsset: 'perpetual_ocean2_currents.mp4',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005425/perpetual_ocean2_CLOSE_093_clean_noDate_1080p30.mp4',
    thumbnail: '/nasa-stills/svs-5425.jpg',
    description: 'Mesoscale ocean eddies and deep thermohaline boundary currents mapping fluid kinetic energy across the Atlantic and Pacific oceans.',
    voiceName: 'Voice 5 (Stereo Strings)',
    sonificationApproach: 'Surface 0–600m white flows pan stereo violin arpeggios, while deep >600m cyan abyssal flows drive resonant cello and double bass lines.',
    displayMode: 'Ocean Eddy Stream + Dual Stereo Strings',
    soundMapping: [
      { data: 'Surface Flows (0-600m)', sound: 'Stereo panned violin arpeggios (440–880 Hz)', type: 'High Strings' },
      { data: 'Deep Abyssal Flows (>600m)', sound: 'Resonant cello & double bass drone (65–130 Hz)', type: 'Deep Cello' },
      { data: 'Mesoscale Eddy Vorticity', sound: 'Undulating tremolo vibrato', type: 'Vorticity LFO' }
    ],
    telemetry: {
      instrument: 'ECCO2 Physical Ocean Circulation Model',
      maxVelocity: '2.4 m/s (Gulf Stream core)',
      depthSlices: '50 vertical levels to 6000m',
      platform: 'NASA JPL Supercomputing Facility'
    },
    tracks: [
      { id: 'surfaceViolin', name: 'Surface Violin Arpeggios', defaultVolume: 80, enabled: true, color: '#0B3D91' },
      { id: 'deepCello', name: 'Abyssal Cello Drone', defaultVolume: 85, enabled: true, color: '#0B3D91' },
      { id: 'eddyMotion', name: 'Eddy Swell Modulator', defaultVolume: 65, enabled: true, color: '#0B3D91' }
    ]
  },
  {
    id: 'svs-5533',
    svsId: 'SVS #5533',
    priority: 6,
    title: 'Air Quality Model Runs (GEOS-CF Pollutants)',
    shortName: 'Air Quality (GEOS-CF)',
    subtitle: 'Goddard Composition Forecasting Model',
    category: 'Atmospheric Chemistry & Human Health',
    accentColor: '#0B3D91',
    accentClass: 'purple',
    badgeText: 'SVS #5533 • Voice 6 (4-Stem Synth Choir)',
    svsUrl: 'http://svs.gsfc.nasa.gov/5533/',
    videoAsset: 'AirQuality_WithLabels_5760x3240_0929.png',
    visualAsset: 'AirQuality_thumb.jpg',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005533/AirQuality_SphereWithLabels_5760x3240.mp4',
    thumbnail: '/nasa-stills/svs-5533.png',
    description: 'High-resolution forecasting of chemical pollutants: ground-level ozone (O3), fine particulate matter (PM2.5), nitrogen dioxide (NO2), and carbon monoxide (CO).',
    voiceName: 'Voice 6 (4-Stem Synth Choir)',
    sonificationApproach: 'Separate synthesized voices for PM2.5, O3, CO, and NOx form a 4-part choir, triggering spoken urban air quality alerts when index thresholds spike.',
    displayMode: 'Pollutant Visualizer + 4-Voice Choir',
    soundMapping: [
      { data: 'Fine Particulates (PM2.5)', sound: 'Warm tenor vocal synth formants', type: 'Tenor Voice' },
      { data: 'Ground-Level Ozone (O3)', sound: 'Bright soprano bell resonance', type: 'Soprano Lead' },
      { data: 'Carbon Monoxide (CO)', sound: 'Low bass hum with tape saturation', type: 'Bass Drone' },
      { data: 'Nitrogen Oxides (NOx)', sound: 'Alto brass swell', type: 'Alto Swell' }
    ],
    telemetry: {
      instrument: 'GEOS-CF High-Res Chemical Forecasting',
      resolution: '0.25° Global Resolution',
      speciesDetected: 'PM2.5, O3, CO, NO2, SO2',
      platform: 'NASA Goddard Space Flight Center'
    },
    tracks: [
      { id: 'pm25Voice', name: 'PM2.5 Particulate Tenor', defaultVolume: 80, enabled: true, color: '#0B3D91' },
      { id: 'o3Voice', name: 'Ozone Soprano Resonator', defaultVolume: 75, enabled: true, color: '#0B3D91' },
      { id: 'coVoice', name: 'Carbon Monoxide Bass', defaultVolume: 70, enabled: true, color: '#0B3D91' },
      { id: 'noxVoice', name: 'Nitrogen Dioxide Alto', defaultVolume: 60, enabled: true, color: '#0B3D91' }
    ]
  },
  {
    id: 'svs-5669',
    svsId: 'SVS #5669',
    priority: 7,
    title: 'GEOS Aerosols (2025) (Smoke, Dust, Salt, Sulfate)',
    shortName: 'GEOS Aerosols 2025',
    subtitle: 'Global Multi-Species Atmospheric Circulation Model',
    category: 'Atmospheric Particulate Transport',
    accentColor: '#D97706',
    accentClass: 'orange',
    badgeText: 'SVS #5669 • Voice 7 (4-Track Ensemble)',
    svsUrl: 'http://svs.gsfc.nasa.gov/5669/',
    videoAsset: 'Aerosols_EarthRotating_1920x1080.mp4',
    visualAsset: 'Aerosols_2025-08-19T20_00_00_5760x3240.png',
    videoUrl: null,
    thumbnail: '/nasa-stills/svs-5669.png',
    description: 'High-resolution simulation of airborne particulates: Saharan mineral dust, Amazon & boreal wildfire smoke, marine sea salt spray, and volcanic sulfate plumes.',
    voiceName: 'Voice 7 (4-Track Ensemble)',
    sonificationApproach: 'Blue Sea Salt = Deep Bass; Pink Dust = Viola; Orange Smoke = Sawtooth Lead; Green Sulfate = Crystalline Bell chime.',
    displayMode: 'Rotating Earth Video + 4-Track Ensemble',
    soundMapping: [
      { data: 'Marine Sea Salt (Blue)', sound: 'Deep oceanic sub-bass pad (65 Hz)', type: 'Sub Bass' },
      { data: 'Saharan Mineral Dust (Pink)', sound: 'Warm viola chord arpeggio (165–330 Hz)', type: 'Viola Pad' },
      { data: 'Wildfire Carbon Smoke (Orange)', sound: 'Analog sawtooth resonant lead synth', type: 'Saw Lead' },
      { data: 'Volcanic Sulfate (Green)', sound: 'Crystalline high bell chime (880–1200 Hz)', type: 'Bell Chime' }
    ],
    telemetry: {
      instrument: 'GEOS-FP Assimilation with MODIS/VIIRS',
      opticalThickness: 'Up to 2.84 AOD',
      resolution: '0.25° x 0.3125° grid',
      platform: 'NASA Goddard Earth Observing System'
    },
    tracks: [
      { id: 'seaSaltBass', name: 'Blue Sea Salt Sub-Bass', defaultVolume: 85, enabled: true, color: '#0B3D91' },
      { id: 'dustViola', name: 'Pink Dust Viola', defaultVolume: 80, enabled: true, color: '#FC3D21' },
      { id: 'smokeLead', name: 'Orange Smoke Saw Lead', defaultVolume: 75, enabled: true, color: '#D97706' },
      { id: 'sulfateBell', name: 'Green Sulfate Bell Chime', defaultVolume: 65, enabled: true, color: '#71717A' }
    ]
  },
  {
    id: 'svs-3912',
    svsId: 'SVS #3912',
    priority: 8,
    title: 'Global Sea Surface Currents & Temp (ECCO2)',
    shortName: 'Sea Currents & Temperature',
    subtitle: 'Thermal Flow & Mesoscale Eddies (2007–2008)',
    category: 'Thermodynamics & Kinetic Energy',
    accentColor: '#0B3D91',
    accentClass: 'blue',
    badgeText: 'SVS #3912 • Voice 8 (Thermal FM Rhodes)',
    svsUrl: 'http://svs.gsfc.nasa.gov/3912/',
    videoAsset: 'flat_global_ecco2_2028x1024.25000.jpg',
    visualAsset: 'ecco2_thermal_flow.mp4',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/ecco2_sst_flow.webmhd.webm',
    thumbnail: '/nasa-stills/svs-3912.jpg',
    description: 'Bipolar thermal flow modeling sea surface temperature gradients from equatorial tropical warmth to polar cooling corridors.',
    voiceName: 'Voice 8 (Thermal FM Rhodes)',
    sonificationApproach: 'Warm equatorial red currents play lush major-pentatonic FM electric piano chords, while cold blue polar currents play deep sub drones.',
    displayMode: 'Thermal Flow Map + FM Rhodes Stems',
    soundMapping: [
      { data: 'Equatorial Warm Currents (>26°C)', sound: 'Lush major-pentatonic FM Rhodes chords', type: 'FM Rhodes' },
      { data: 'Polar Cold Currents (<4°C)', sound: 'Deep sub drone & resonant tape swell (55 Hz)', type: 'Polar Drone' },
      { data: 'Thermal Boundary Gradients', sound: 'Gentle phased chorus sweep', type: 'Thermal Sweep' }
    ],
    telemetry: {
      instrument: 'ECCO2 Global Data Synthesis Model',
      temperatureRange: '-2°C to 34°C SST',
      resolution: 'Quarter-degree global grid',
      platform: 'NASA JPL / ECCO Project'
    },
    tracks: [
      { id: 'fmRhodes', name: 'Thermal FM Rhodes Chords', defaultVolume: 85, enabled: true, color: '#0B3D91' },
      { id: 'polarDrone', name: 'Polar Cold Sub Drone', defaultVolume: 75, enabled: true, color: '#0B3D91' },
      { id: 'thermalSweep', name: 'Thermal Gradient Chorus', defaultVolume: 60, enabled: true, color: '#0B3D91' }
    ]
  },
  {
    id: 'svs-5313',
    svsId: 'SVS #5313',
    priority: 9,
    title: 'Change in Night Lights 2012–2023 (India Zoom)',
    shortName: 'Night Lights (India Zoom)',
    subtitle: 'Decadal Anthropogenic Illumination Shift',
    category: 'Urbanization & Infrastructure Grids',
    accentColor: '#0B3D91',
    accentClass: 'purple',
    badgeText: 'SVS #5313 • Voice 9 (Urban Arpeggiator)',
    svsUrl: 'http://svs.gsfc.nasa.gov/5313/',
    videoAsset: 'nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4',
    visualAsset: 'nightlights_india_zoom_still.jpg',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a000000/a005300/a005313/nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4',
    thumbnail: '/nasa-stills/svs-5313.jpg',
    description: 'Decadal longitudinal satellite observation tracking global electrification: rapid Indian subcontinent illumination growth and shifting global urban cores.',
    voiceName: 'Voice 9 (Urban Arpeggiator)',
    sonificationApproach: 'Purple brightening zones (India pop-out) raise arpeggio tempo from 90 to 140 BPM; orange dimming zones slow tempo down.',
    displayMode: 'Decadal Night Lights Video + Urban Arp',
    soundMapping: [
      { data: 'Urban Light Growth (India)', sound: 'Accelerating pentatonic arpeggio (90 to 140 BPM)', type: 'Tempo Pulse' },
      { data: 'Baseline Night Radiance', sound: 'Warm sub-bass foundation (55–110 Hz)', type: 'Sub Foundation' },
      { data: 'Darkened Rural Zones', sound: 'Subtle low-pass filtering & negative space', type: 'Negative Space' }
    ],
    telemetry: {
      instrument: 'Suomi NPP VIIRS Day/Night Band',
      baselineSpan: '2012 to 2023 Decadal Longitudinal',
      tempoMapping: '90 BPM (dim) to 140 BPM (bright)',
      platform: 'NASA / NOAA Joint Suomi NPP Satellite'
    },
    tracks: [
      { id: 'urbanArp', name: 'Urban Tempo Arpeggiator', defaultVolume: 85, enabled: true, color: '#0B3D91' },
      { id: 'subLuminance', name: 'Sub-Bass Luminance Wave', defaultVolume: 80, enabled: true, color: '#0B3D91' },
      { id: 'gridPulse', name: 'Electrification Clock Pulse', defaultVolume: 65, enabled: true, color: '#0B3D91' }
    ]
  },
  {
    id: 'svs-13786',
    svsId: 'SVS #13786',
    priority: 10,
    title: 'Data Sonification: Caldwell 73 (Hubble Reference)',
    shortName: 'Caldwell 73 Sonification',
    subtitle: 'Official NASA Goddard Astronomical Sonification',
    category: 'NASA Official Sonification Benchmark',
    accentColor: '#0B3D91',
    accentClass: 'pink',
    badgeText: 'SVS #13786 • Voice 10 (NASA Reference Mode)',
    svsUrl: 'http://svs.gsfc.nasa.gov/13786/',
    videoAsset: 'wide.jpg',
    visualAsset: 'caldwell_73_sonification.mp4',
    videoUrl: 'https://svs.gsfc.nasa.gov/vis/a010000/a013700/a013786/Caldwell73_2K_Final.webm',
    thumbnail: '/nasa-stills/svs-13786.jpg',
    description: 'Official NASA benchmark sonification of globular cluster NGC 1851: mapping radial brightness and spectral color to acoustic instruments.',
    voiceName: 'Voice 10 (NASA Reference Mode)',
    sonificationApproach: 'Vocal Choir pad for mid frequencies + Marimba for warm red/orange pixels + Glockenspiel for bright blue stars.',
    displayMode: 'Hubble Sonification Video + Tri-Voice Ensemble',
    soundMapping: [
      { data: 'Mid-Frequency Ambient Stars', sound: 'Vocal Choir Pad sustained chord', type: 'Choir Pad' },
      { data: 'Warm Red/Orange Pixels', sound: 'Warm Marimba mallet strike (220–440 Hz)', type: 'Marimba' },
      { data: 'Bright Blue Star Pixels', sound: 'Crystalline Glockenspiel chime (880–1200 Hz)', type: 'Glockenspiel' }
    ],
    telemetry: {
      instrument: 'Hubble Space Telescope ACS & WFC3',
      target: 'Globular Cluster NGC 1851 (Caldwell 73)',
      methodology: 'RGB Radius-to-Pitch Spatial Scanning',
      platform: 'NASA Goddard Astronomy Sonification'
    },
    tracks: [
      { id: 'caldwellChoir', name: 'Hubble Choir Pad', defaultVolume: 80, enabled: true, color: '#0B3D91' },
      { id: 'caldwellMarimba', name: 'Red/Orange Pixel Marimba', defaultVolume: 85, enabled: true, color: '#FC3D21' },
      { id: 'caldwellGlock', name: 'Blue Pixel Glockenspiel', defaultVolume: 75, enabled: true, color: '#FC3D21' }
    ]
  }
];

export const NASA_CHALLENGE_INFO = {
  challengeTitle: 'The Earth Information Jukebox',
  edition: 'NASA International Space Apps Challenge 2026',
  codeFreeze: 'Sunday, 15 November, at 2:00 PM',
  theme: 'Space Blue & Earthy Planetary Aesthetic',
  missionGoal: 'Translate 10 official NASA SVS visual models and satellite observation datasets into real-time, synchronized multi-track audio sonification.',
  sourcesCount: 10
};
