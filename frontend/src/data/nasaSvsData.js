/**
 * nasaSvsData.js
 * Master 10 Official NASA SVS Sources, Visuals, Videos & Voice Mappings
 * Reference: Master Antigravity Blueprint: The Earth Information Jukebox
 */

export const NASA_SVS_DATASETS = [
  {
    svsId: 'SVS #4950',
    id: 'svs-4950-gedi',
    title: 'GEDI Forest Height (ISS LiDAR 3D Canopy)',
    shortName: 'GEDI Forest Height',
    category: 'Biomass & LiDAR Canopy Structure',
    voiceName: 'Voice 1 (Harp & Woodwind)',
    voiceDescription: 'Canopy height (0–50m) drives pentatonic pitch (110–880 Hz) + spoken height voiceover.',
    accentColor: '#10b981',
    videoAsset: 'GEDI_global_w_colorbar_1080p60.mp4',
    visualAsset: 'GEDI_global_w_colorbar_0900_print.jpg',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20181129_GEDI_Canopy/GSFC_20181129_GEDI_Canopy~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      canopyRange: '0 – 52.4 meters',
      instrument: 'Global Ecosystem Dynamics Investigation (GEDI) LiDAR',
      spectralHz: '110 Hz – 880 Hz',
      platform: 'International Space Station (ISS JEM-EF)'
    },
    audioVoice: {
      type: 'harp_woodwind',
      baseFreq: 220,
      scale: [110, 164.81, 220, 329.63, 440, 659.25, 880]
    }
  },
  {
    svsId: 'SVS #4960',
    id: 'svs-4960-atmos-river',
    title: '3D Atmospheric River (MERRA-2 Model)',
    shortName: '3D Atmospheric River',
    category: 'Hydrological Vapor Transport',
    voiceName: 'Voice 2 (Native NASA Narration + Rain Pad)',
    voiceDescription: 'Plays NASA voiceover track + moisture density wind/rain filter sweep.',
    accentColor: '#38bdf8',
    videoAsset: 'atmos_rivers_narrated_HD.mp4',
    visualAsset: 'atmos_rivers_narrated_HD.webm',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20170417_Atmos_Rivers/GSFC_20170417_Atmos_Rivers~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      integratedVapor: '750+ kg/m/s IVT plume',
      instrument: 'MERRA-2 Modern-Era Retrospective Analysis',
      spectralHz: '65 Hz – 2.4 kHz Filter Sweep',
      platform: 'Goddard Earth Observing System'
    },
    audioVoice: {
      type: 'rain_pad',
      baseFreq: 130.81,
      filterMod: 'moisture_sweep'
    }
  },
  {
    svsId: 'SVS #5011',
    id: 'svs-5011-iss-lightning',
    title: 'ISS Lightning Events (2017–2023 LIS Sensor)',
    shortName: 'ISS Lightning Events',
    category: 'Orbital Optical Transients',
    voiceName: 'Voice 3 (Orbital Percussion)',
    voiceDescription: 'White/violet flash contours trigger crisp marimba & electronic snare hits.',
    accentColor: '#f59e0b',
    videoAsset: 'iss_lightning_sphere_07312023.mp4',
    visualAsset: 'iss_lightning_preview.jpg',
    videoUrl: 'https://images-assets.nasa.gov/video/NHQ_2019_0607_Lightning%20from%20Space/NHQ_2019_0607_Lightning%20from%20Space~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      flashDetection: '566 frames/sec CCD grid',
      radiantEnergy: 'Up to 140 µJ/m²/sr',
      spectralHz: 'Sharp transient burst + kick sub',
      platform: 'ISS Lightning Imaging Sensor (ISS-LIS)'
    },
    audioVoice: {
      type: 'marimba_percussion',
      trigger: 'flash_contours'
    }
  },
  {
    svsId: 'SVS #5196',
    id: 'svs-5196-co2-globe',
    title: 'DYAMOND Global Carbon Dioxide (CO2 ppm)',
    shortName: 'DYAMOND CO2 ppm',
    category: 'Greenhouse Gas Respiration',
    voiceName: 'Voice 4 (Breathing Sub-Bass)',
    voiceDescription: 'Day/night CO2 respiration pulsing drives a rhythmic 65–220 Hz LFO bass pulse.',
    accentColor: '#ef4444',
    videoAsset: 'dyamondPointCloud_12-1-2023b_dyamond_co2_anim_globe_orbit_1080p30_h265.mp4',
    visualAsset: 'dyamond_co2_still.jpg',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20161213_CO2_Breathing/GSFC_20161213_CO2_Breathing~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      co2Range: '395 – 422 ppm',
      instrument: 'DYAMOND High-Res Simulation + OCO-2',
      spectralHz: '65 Hz – 220 Hz LFO Respiration',
      platform: 'Orbiting Carbon Observatory-2'
    },
    audioVoice: {
      type: 'breathing_sub_bass',
      lfoRate: '0.4Hz_diurnal'
    }
  },
  {
    svsId: 'SVS #5425',
    id: 'svs-5425-perpetual-ocean',
    title: 'Perpetual Ocean 2 (Western Boundary Currents)',
    shortName: 'Perpetual Ocean 2',
    category: 'Deep Oceanic Thermohaline Flow',
    voiceName: 'Voice 5 (Stereo Strings)',
    voiceDescription: 'Surface 0–600m white flows pan violin arpeggios; >600m cyan flows drive deep cello.',
    accentColor: '#00f0ff',
    videoAsset: 'perpetual_ocean2_CLOSE_095_beauty_600m_and_below.14000_print.jpg',
    visualAsset: 'perpetual_ocean2_currents.mp4',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20120320_PerpetualOcean/GSFC_20120320_PerpetualOcean~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      depthLayers: '0 – 600m surface / >600m abyssal',
      velocityMax: '2.1 m/s Gulf Stream & Kuroshio',
      spectralHz: 'Stereo Cello (65 Hz) & Violin Arp (880 Hz)',
      platform: 'ECCO2 General Circulation Model'
    },
    audioVoice: {
      type: 'stereo_strings',
      dualLayer: true
    }
  },
  {
    svsId: 'SVS #5533',
    id: 'svs-5533-air-quality',
    title: 'Air Quality Model Runs (GEOS-CF Pollutants)',
    shortName: 'Air Quality Model (GEOS-CF)',
    category: 'Atmospheric Chemistry & Human Health',
    voiceName: 'Voice 6 (4-Stem Synth Choir)',
    voiceDescription: 'Separate voices for PM2.5, O3, CO, and NOx + spoken urban air quality alert.',
    accentColor: '#a855f7',
    videoAsset: 'AirQuality_WithLabels_5760x3240_0929.png',
    visualAsset: 'AirQuality_WithLabels_thumb.jpg',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20180823_GEOS_Aerosols/GSFC_20180823_GEOS_Aerosols~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      species: 'PM2.5, O3, CO, NOx, SO2',
      alertThreshold: 'AQI > 150 Unhealthy Alert',
      spectralHz: '4-Voice Formant Choir (220–784 Hz)',
      platform: 'Goddard Composition Forecasting (GEOS-CF)'
    },
    audioVoice: {
      type: 'synth_choir',
      stems: 4
    }
  },
  {
    svsId: 'SVS #5669',
    id: 'svs-5669-geos-aerosols',
    title: 'GEOS Aerosols (2025) (Smoke, Dust, Salt, Sulfate)',
    shortName: 'GEOS Aerosols (2025)',
    category: 'Multi-Species Atmospheric Plumes',
    voiceName: 'Voice 7 (4-Track Ensemble)',
    voiceDescription: 'Blue Salt = Bass; Pink Dust = Viola; Orange Smoke = Saw Lead; Green Sulfate = Bell.',
    accentColor: '#f97316',
    videoAsset: 'Aerosols_EarthRotating_1920x1080.mp4',
    visualAsset: 'Aerosols_2025-08-19T20_00_00_5760x3240.png',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20180823_GEOS_Aerosols/GSFC_20180823_GEOS_Aerosols~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      plumeSpecies: 'Salt (Blue), Dust (Pink), Smoke (Orange), Sulfate (Green)',
      opticalDepthMax: '2.84 AOD',
      spectralHz: 'Sub-bass, Viola, Sawtooth, Crystalline Bell',
      platform: 'GEOS Forward Processing Earth Model'
    },
    audioVoice: {
      type: 'four_track_ensemble',
      stems: ['salt_bass', 'dust_viola', 'smoke_saw', 'sulfate_bell']
    }
  },
  {
    svsId: 'SVS #3912',
    id: 'svs-3912-sea-surface-temp',
    title: 'Global Sea Surface Currents & Temp (ECCO2)',
    shortName: 'Sea Surface Currents & Temp',
    category: 'Thermodynamics & Kinetic Energy',
    voiceName: 'Voice 8 (Thermal FM Rhodes)',
    voiceDescription: 'Warm red currents play major-pentatonic chords; cold blue currents play deep drones.',
    accentColor: '#3b82f6',
    videoAsset: 'flat_global_ecco2_2028x1024.25000.jpg',
    visualAsset: 'ecco2_thermal_flow.mp4',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20120320_PerpetualOcean/GSFC_20120320_PerpetualOcean~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      tempRange: '-2°C to 34°C sea surface temperature',
      instrument: 'ECCO2 Thermal Flow Model (2007–2008)',
      spectralHz: 'FM Rhodes (329 Hz) & Deep Sub Drone (55 Hz)',
      platform: 'NASA JPL / ECCO Project'
    },
    audioVoice: {
      type: 'thermal_fm_rhodes',
      dynamicScale: 'bipolar_temperature'
    }
  },
  {
    svsId: 'SVS #5313',
    id: 'svs-5313-night-lights-india',
    title: 'Change in Night Lights 2012–2023 (EIC India Zoom)',
    shortName: 'Night Lights (India Zoom)',
    category: 'Urbanization & Electrification Grids',
    voiceName: 'Voice 9 (Urban Arpeggiator)',
    voiceDescription: 'Purple brightening zones (India pop-out) raise BPM (90–140); orange dimming slows tempo.',
    accentColor: '#c084fc',
    videoAsset: 'nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4',
    visualAsset: 'nightlights_india_zoom_still.jpg',
    videoUrl: 'https://images-assets.nasa.gov/video/Earth%20at%20Night/Earth%20at%20Night~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      urbanLuminance: '0.5 to 1000 nW/cm²/sr',
      tempoBPM: '90 BPM (dim) to 140 BPM (brightening)',
      regionalFocus: 'Indian Subcontinent & East Asia Electrification',
      platform: 'Suomi NPP VIIRS Day/Night Band'
    },
    audioVoice: {
      type: 'urban_arpeggiator',
      tempoBPM: 120
    }
  },
  {
    svsId: 'SVS #13786',
    id: 'svs-13786-caldwell-73',
    title: 'Data Sonification: Caldwell 73 (Hubble Reference)',
    shortName: 'Caldwell 73 Sonification',
    category: 'NASA Official Sonification Reference',
    voiceName: 'Voice 10 (NASA Reference Mode)',
    voiceDescription: 'Choir pad + Marimba for warm red/orange pixels + Glockenspiel for blue pixels.',
    accentColor: '#e879f9',
    videoAsset: 'wide.jpg',
    visualAsset: 'caldwell_73_sonification.mp4',
    videoUrl: 'https://images-assets.nasa.gov/video/GSFC_20200922_Hubble_Sonification/GSFC_20200922_Hubble_Sonification~orig.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
    telemetry: {
      target: 'Globular Cluster NGC 1851 (Caldwell 73)',
      instrument: 'Hubble Space Telescope ACS / WFC3',
      voiceMapping: 'Choir Pad (Mid), Marimba (Warm Red), Glockenspiel (Blue)',
      platform: 'NASA Goddard Astronomy Sonification Project'
    },
    audioVoice: {
      type: 'caldwell_reference',
      stems: ['choir_pad', 'marimba_warm', 'glockenspiel_blue']
    }
  }
];
