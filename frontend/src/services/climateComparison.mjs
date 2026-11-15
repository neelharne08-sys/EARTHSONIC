export const COMPARISON_VARIABLES = [
  { id: 'temperature_c', title: 'Temperature', unit: '°C', colorA: '#0B3D91', colorB: '#FC3D21' },
  { id: 'relative_humidity_pct', title: 'Relative humidity', unit: '%', colorA: '#0B3D91', colorB: '#FC3D21' },
  { id: 'wind_speed_mps', title: 'Wind speed', unit: 'm/s', colorA: '#0B3D91', colorB: '#FC3D21' }
];

export const CITY_PRESETS = [
  { label: 'Nagpur, India', latitude: 21.1458, longitude: 79.0882 },
  { label: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { label: 'New York, USA', latitude: 40.7128, longitude: -74.0060 },
  { label: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { label: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { label: 'Cape Town, South Africa', latitude: -33.9249, longitude: 18.4241 },
  { label: 'Rio de Janeiro, Brazil', latitude: -22.9068, longitude: -43.1729 },
  { label: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
];

export function validLocation(latitude, longitude) {
  if (latitude === '' || longitude === '' || latitude == null || longitude == null) return false;
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180;
}

export function isISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateDateRange(start, end) {
  if (!isISODate(start) || !isISODate(end)) throw new Error('Select valid start and end dates.');
  if (start < '1981-01-01') throw new Error('NASA POWER daily data starts in 1981.');
  const days = Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
  if (days < 1 || days > 31) throw new Error('Select a chronological date range of 1–31 days.');
  return days;
}

export function buildClimateQuery(location, start, end) {
  if (!validLocation(location?.latitude, location?.longitude)) throw new Error('Select valid coordinates for both locations.');
  validateDateRange(start, end);
  return new URLSearchParams({
    latitude: String(Number(location.latitude)),
    longitude: String(Number(location.longitude)),
    start: start.replaceAll('-', ''),
    end: end.replaceAll('-', '')
  }).toString();
}

export function validateClimatePayload(payload) {
  if (payload?.status !== 'success' || !Array.isArray(payload?.data?.samples)) {
    throw new Error('NASA POWER climate data was not returned in the expected format.');
  }
  const samples = payload.data.samples;
  if (samples.length < 1 || samples.length > 31) throw new Error('Unexpected number of NASA daily samples.');
  for (const sample of samples) {
    if (!isISODate(sample?.date) || !sample?.measurements || !sample?.sonification) {
      throw new Error('NASA POWER returned an invalid daily sample.');
    }
  }
  return samples;
}

export function isMeasurement(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function alignSamples(aPayload, bPayload) {
  const a = validateClimatePayload(aPayload);
  const b = validateClimatePayload(bPayload);
  const aByDate = new Map(a.map(sample => [sample.date, sample]));
  const bByDate = new Map(b.map(sample => [sample.date, sample]));
  const dates = [...new Set([...aByDate.keys(), ...bByDate.keys()])].sort();
  return dates.map(date => ({
    date,
    a: aByDate.get(date)?.measurements ?? {},
    b: bByDate.get(date)?.measurements ?? {}
  }));
}

export function summarize(rows, field) {
  const av = rows.map(row => row.a[field]).filter(isMeasurement);
  const bv = rows.map(row => row.b[field]).filter(isMeasurement);
  const average = xs => xs.length ? xs.reduce((total, x) => total + x, 0) / xs.length : null;
  const averageA = average(av);
  const averageB = average(bv);
  return {
    averageA, averageB, difference: averageA === null || averageB === null ? null : averageA - averageB,
    samplesA: av.length, samplesB: bv.length,
    minA: av.length ? Math.min(...av) : null, maxA: av.length ? Math.max(...av) : null,
    minB: bv.length ? Math.min(...bv) : null, maxB: bv.length ? Math.max(...bv) : null
  };
}

export function chartGeometry(rows, field) {
  const values = rows.flatMap(row => [row.a[field], row.b[field]]).filter(isMeasurement);
  if (!values.length) return { min: 0, max: 1, pathsA: [], pathsB: [] };
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = Math.max(0.25, (maxValue - minValue) * 0.12);
  const min = minValue - padding;
  const max = maxValue + padding;
  const plot = key => {
    const paths = [];
    let points = [];
    rows.forEach((row, index) => {
      const value = row[key][field];
      if (!isMeasurement(value)) {
        if (points.length) paths.push(points.join(' '));
        points = [];
      } else {
        const x = rows.length === 1 ? 400 : 42 + index * 716 / (rows.length - 1);
        const y = 174 - (value - min) * 142 / (max - min);
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
    });
    if (points.length) paths.push(points.join(' '));
    return paths;
  };
  return { min, max, pathsA: plot('a'), pathsB: plot('b') };
}

export function makeCSV(rows, labelA, labelB) {
  const clean = value => String(value).replaceAll('"', '""');
  const safe = value => `"${clean(value)}"`;
  const header = ['Date UTC'];
  for (const variable of COMPARISON_VARIABLES) {
    header.push(`${labelA} ${variable.title} (${variable.unit})`, `${labelB} ${variable.title} (${variable.unit})`);
  }
  const data = rows.map(row => {
    const columns = [row.date];
    for (const variable of COMPARISON_VARIABLES) {
      for (const side of ['a', 'b']) {
        const value = row[side][variable.id];
        columns.push(isMeasurement(value) ? String(value) : '');
      }
    }
    return columns.map(safe).join(',');
  });
  return '\uFEFF' + [header.map(safe).join(','), ...data].join('\r\n') + '\r\n';
}
