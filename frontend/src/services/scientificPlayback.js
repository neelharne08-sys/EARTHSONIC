export const SCIENCE_LAYERS = [
  { id: 'temperature_c', label: 'Temperature', unit: '°C', type: 'sine', color: '#0B3D91' },
  { id: 'relative_humidity_pct', label: 'Humidity', unit: '%', type: 'triangle', color: '#D97706' },
  { id: 'wind_speed_mps', label: 'Wind speed', unit: 'm/s', type: 'sine', color: '#FC3D21' }
];

export const SCIENCE_DAY_SECONDS = 0.75;

export function clampVolume(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
}

export function layerLevel(volume, muted) {
  return muted ? 0 : (clampVolume(volume) / 100) * 0.17;
}

export function validateClimateResponse(payload) {
  if (payload?.status !== 'success' || !Array.isArray(payload?.data?.samples)) {
    throw new Error('NASA climate response did not include daily measurements.');
  }
  const samples = payload.data.samples;
  if (samples.length < 1 || samples.length > 31) {
    throw new Error('Climate playback requires between 1 and 31 daily samples.');
  }
  for (const sample of samples) {
    if (typeof sample?.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(sample.date) || !sample?.measurements || !sample?.sonification) {
      throw new Error('NASA climate response contained an invalid daily sample.');
    }
  }
  return samples;
}

export function scheduleClimateAudio(context, layerGains, samples, fromIndex, startAt, daySeconds = SCIENCE_DAY_SECONDS) {
  if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= samples.length) {
    throw new RangeError('Playback start day is outside the loaded dates.');
  }
  let scheduled = 0;
  for (let index = fromIndex; index < samples.length; index += 1) {
    const begins = startAt + (index - fromIndex) * daySeconds;
    for (const layer of SCIENCE_LAYERS) {
      const frequency = samples[index].sonification?.[layer.id]?.frequency_hz;
      if (typeof frequency !== 'number' || !Number.isFinite(frequency) || frequency < 20 || frequency > 20000) continue;
      const destination = layerGains[layer.id];
      if (!destination) continue;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = layer.type;
      oscillator.frequency.setValueAtTime(frequency, begins);
      envelope.gain.setValueAtTime(0.0001, begins);
      envelope.gain.exponentialRampToValueAtTime(1, begins + 0.035);
      envelope.gain.exponentialRampToValueAtTime(0.0001, begins + daySeconds * 0.88);
      oscillator.connect(envelope);
      envelope.connect(destination);
      oscillator.start(begins);
      oscillator.stop(begins + daySeconds * 0.9);
      scheduled += 1;
    }
  }
  return scheduled;
}
