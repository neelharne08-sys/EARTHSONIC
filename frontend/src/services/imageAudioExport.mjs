const SCAN_COUNT = 100;

export function readImageSoundSample(analysis, currentTime, duration) {
  const brightness = analysis?.brightness;
  const frequencies = analysis?.frequencies;
  if (!Array.isArray(brightness) || !Array.isArray(frequencies) || brightness.length !== SCAN_COUNT || frequencies.length !== SCAN_COUNT) {
    return null;
  }
  const length = Number(duration);
  if (!Number.isFinite(length) || length <= 0) return null;
  const time = Number.isFinite(Number(currentTime)) ? Math.max(0, Math.min(length, Number(currentTime))) : 0;
  const index = Math.min(SCAN_COUNT - 1, Math.floor(time / length * SCAN_COUNT));
  if (typeof brightness[index] !== 'number' || typeof frequencies[index] !== 'number') return null;
  const value = brightness[index];
  const frequency = frequencies[index];
  if (!Number.isFinite(value) || value < 0 || value > 1 || !Number.isFinite(frequency) || frequency <= 0) return null;
  return { index, slice: index + 1, brightness: value, frequency, progress: time / length };
}

export function validateImageAudio(analysis) {
  if (!Array.isArray(analysis?.brightness) || !Array.isArray(analysis?.frequencies)
      || analysis.brightness.length !== SCAN_COUNT || analysis.frequencies.length !== SCAN_COUNT) {
    throw new Error('Analyze a NASA still image before exporting image-scan audio.');
  }
  for (let i = 0; i < SCAN_COUNT; i += 1) {
    const bright = analysis.brightness[i];
    const hz = analysis.frequencies[i];
    if (typeof bright !== 'number' || typeof hz !== 'number') throw new Error(`Invalid image scan values at slice ${i + 1}.`);
    if (!Number.isFinite(bright) || bright < 0 || bright > 1 || !Number.isFinite(hz) || hz < 20 || hz > 20000) {
      throw new Error(`Invalid image scan values at slice ${i + 1}.`);
    }
  }
}

export function renderImageScanPcm(analysis, options = {}) {
  validateImageAudio(analysis);
  const seconds = Number(options.durationSeconds ?? 45);
  const rate = Number(options.sampleRate ?? 16000);
  const volume = Number(options.volume ?? 0.65);
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 180 || !Number.isInteger(rate) || rate < 8000 || rate > 48000 || !Number.isFinite(volume) || volume < 0 || volume > 1) {
    throw new Error('Unsupported audio render settings.');
  }
  const frameCount = Math.round(seconds * rate);
  const samples = new Float32Array(frameCount);
  let phase = 0;
  let smoothFrequency = analysis.frequencies[0];
  let smoothGain = 0;
  const smoothing = 1 - Math.exp(-1 / (rate * 0.035));
  for (let frame = 0; frame < frameCount; frame += 1) {
    const t = frame / rate;
    const index = Math.min(SCAN_COUNT - 1, Math.floor(t / seconds * SCAN_COUNT));
    const targetFrequency = analysis.frequencies[index];
    const targetGain = Math.max(0.01, analysis.brightness[index]) * 0.4 * volume;
    smoothFrequency += (targetFrequency - smoothFrequency) * smoothing;
    smoothGain += (targetGain - smoothGain) * smoothing;
    phase += smoothFrequency / rate;
    phase -= Math.floor(phase);
    const triangle = 1 - 4 * Math.abs(phase - 0.5);
    const fade = Math.min(1, t / 0.035, (seconds - t) / 0.075);
    samples[frame] = Math.max(-1, Math.min(1, triangle * smoothGain * Math.max(0, fade)));
  }
  return samples;
}

export function encodeWavMono(samples, sampleRate = 16000) {
  if (!(samples instanceof Float32Array) || samples.length === 0 || !Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 48000) {
    throw new Error('Invalid PCM data.');
  }
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset, value) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, Math.round(value < 0 ? value * 32768 : value * 32767), true);
  }
  return buffer;
}

export function createImageScanWav(analysis, options = {}) {
  const sampleRate = options.sampleRate ?? 16000;
  const samples = renderImageScanPcm(analysis, options);
  return encodeWavMono(samples, sampleRate);
}
