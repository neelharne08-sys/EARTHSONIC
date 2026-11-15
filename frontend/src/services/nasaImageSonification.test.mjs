import test from 'node:test';
import assert from 'node:assert/strict';
import { scanLuminance } from './nasaImageSonification.mjs';
import { NASA_STILLS, getNasaStill } from './nasaStills.mjs';

function pixels(fn) {
  const values = new Uint8ClampedArray(100 * 70 * 4);
  for (let y = 0; y < 70; y++) {
    for (let x = 0; x < 100; x++) {
      const index = (y * 100 + x) * 4;
      const brightness = fn(x, y);
      values[index] = brightness;
      values[index + 1] = brightness;
      values[index + 2] = brightness;
      values[index + 3] = 255;
    }
  }
  return values;
}

test('10 NASA stations have official SVS image and source URLs', () => {
  assert.equal(Object.keys(NASA_STILLS).length, 10);
  for (const [id, entry] of Object.entries(NASA_STILLS)) {
    assert.ok(entry.remote.startsWith('https://svs.gsfc.nasa.gov/vis/'));
    assert.ok(entry.sourceUrl.startsWith('https://svs.gsfc.nasa.gov/'));
    assert.ok(getNasaStill(id).local.startsWith('/nasa-stills/'));
  }
});

test('image brightness scan produces 100 samples and pitch values', () => {
  const result = scanLuminance(pixels(x => Math.round(x * 255 / 99)));
  assert.equal(result.sample_count, 100);
  assert.equal(result.frequencies.length, 100);
  assert.equal(result.brightness.length, 100);
  assert.equal(result.frequencies[0], 180);
  assert.equal(result.frequencies[99], 760);
});

test('flat image maps to a neutral middle pitch without divide by zero', () => {
  const result = scanLuminance(pixels(() => 150));
  assert.ok(result.brightness.every(x => x === 0.5));
  assert.ok(result.frequencies.every(x => x === 470));
});

test('scan rejects broken image data', () => {
  assert.throws(() => scanLuminance(new Uint8ClampedArray(10)), /Invalid/);
});
