import test from 'node:test';
import assert from 'node:assert/strict';
import { readImageSoundSample, validateImageAudio, renderImageScanPcm, encodeWavMono, createImageScanWav } from './imageAudioExport.mjs';

const sampleData = () => ({
  brightness: Array.from({ length: 100 }, (_, i) => i / 99),
  frequencies: Array.from({ length: 100 }, (_, i) => 180 + i * 580 / 99)
});

test('no fabricated sample while NASA image data is unavailable', () => {
  assert.equal(readImageSoundSample(null, 0, 45), null);
  assert.equal(readImageSoundSample({ brightness: [] }, 20, 45), null);
});

test('readout aligns with 100-slice playback at boundaries', () => {
  const data = sampleData();
  assert.equal(readImageSoundSample(data, 0, 45).slice, 1);
  assert.equal(readImageSoundSample(data, 22.5, 45).slice, 51);
  assert.equal(readImageSoundSample(data, 45, 45).slice, 100);
  assert.equal(readImageSoundSample(data, -8, 45).slice, 1);
});

test('readout rejects invalid measurements rather than displaying fallback', () => {
  const data = sampleData();
  data.frequencies[0] = Number.NaN;
  assert.equal(readImageSoundSample(data, 0, 45), null);
});

test('export refuses uncomputed or corrupted sample arrays', () => {
  assert.throws(() => validateImageAudio(null), /Analyze/);
  assert.throws(() => createImageScanWav({ brightness: [], frequencies: [] }), /Analyze/);
  const data = sampleData();
  data.brightness[20] = 2;
  assert.throws(() => createImageScanWav(data), /Invalid image scan/);
});

test('render produces correctly sized finite PCM, without clipping', () => {
  const samples = renderImageScanPcm(sampleData(), { durationSeconds: 2, sampleRate: 8000 });
  assert.equal(samples.length, 16000);
  assert.ok(samples[0] === 0);
  assert.ok(samples.every(v => Number.isFinite(v) && Math.abs(v) <= 1));
});

test('WAV produces valid uncompressed PCM header and data length', () => {
  const output = createImageScanWav(sampleData(), { durationSeconds: 2, sampleRate: 8000 });
  const view = new DataView(output);
  const text = (offset, length) => Array.from({ length }, (_, i) => String.fromCharCode(view.getUint8(offset + i))).join('');
  assert.equal(text(0, 4), 'RIFF');
  assert.equal(text(8, 4), 'WAVE');
  assert.equal(text(36, 4), 'data');
  assert.equal(view.getUint16(20, true), 1);
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 8000);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(view.getUint32(40, true), 32000);
  assert.equal(output.byteLength, 32044);
});

test('invalid settings fail safely', () => {
  assert.throws(() => renderImageScanPcm(sampleData(), { durationSeconds: 500 }), /settings/);
  assert.throws(() => encodeWavMono(new Float32Array()), /PCM/);
});

test('changing the scan data changes exported audio', () => {
  const a = sampleData();
  const b = sampleData();
  b.brightness.reverse();
  b.frequencies.reverse();
  const x = new DataView(createImageScanWav(a, { durationSeconds: 1, sampleRate: 8000 }));
  const y = new DataView(createImageScanWav(b, { durationSeconds: 1, sampleRate: 8000 }));
  assert.notEqual(x.getInt16(500, true), y.getInt16(500, true));
});
