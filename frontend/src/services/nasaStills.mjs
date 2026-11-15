export const NASA_STILLS = Object.freeze({
  'svs-4950': {
    title: 'GEDI forest height',
    filename: 'svs-4950.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004950/GEDI_global_w_colorbar_0900_print.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/4950/'
  },
  'svs-4960': {
    title: 'Atmospheric river',
    filename: 'svs-4960.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004960/atmos_rivers_narrated_4k.00090_print.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/4960/'
  },
  'svs-5011': {
    title: 'Lightning events detected from ISS',
    filename: 'svs-5011.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005011/iss_lightning_preview.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5011/'
  },
  'svs-5196': {
    title: 'DYAMOND global carbon dioxide',
    filename: 'svs-5196.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005196/dyamondPointCloud_12-1-2023b_dyamond_co2_anim_globe_orbit_3x3Hyperwall.00200_print.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5196/'
  },
  'svs-5425': {
    title: 'Perpetual ocean currents',
    filename: 'svs-5425.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005425/perpetual_ocean2_CLOSE_093_4k_clean_noDate.00000_print.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5425/'
  },
  'svs-5533': {
    title: 'GEOS-CF air quality',
    filename: 'svs-5533.png',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005533/AirQuality_Sphere_1920x1080_0000.png',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5533/'
  },
  'svs-5669': {
    title: 'GEOS Aerosols 2025',
    filename: 'svs-5669.png',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005669/Aerosols_2025-08-19T20_00_00_1920x1080.png',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5669/'
  },
  'svs-3912': {
    title: 'Global sea surface currents and temperature',
    filename: 'svs-3912.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/flat_global_ecco2_2028x1024.25000.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/3912/'
  },
  'svs-5313': {
    title: 'Night lights change 2012–2023',
    filename: 'svs-5313.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a000000/a005300/a005313/nightlights_flat_series_and_change_wZooms_13_EIC.02599_print.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5313/'
  },
  'svs-13786': {
    title: 'Caldwell 73',
    filename: 'svs-13786.jpg',
    remote: 'https://svs.gsfc.nasa.gov/vis/a010000/a013700/a013786/print.jpg',
    sourceUrl: 'https://svs.gsfc.nasa.gov/13786/'
  }
});

export function getNasaStill(stationId) {
  const still = NASA_STILLS[stationId];
  return still ? { ...still, local: `/nasa-stills/${still.filename}` } : null;
}
