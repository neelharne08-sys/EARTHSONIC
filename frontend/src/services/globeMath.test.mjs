import test from 'node:test';
import assert from 'node:assert/strict';
import { clampLatitude, normalizeLocation, projectLocation, unprojectLocation, wrapLongitude } from './globeMath.mjs';

test('the center of the globe maps back to the center location', () => {
  const result = unprojectLocation(0, 0, 21.1458, 79.0882);
  assert.ok(Math.abs(result.latitude - 21.1458) < 1e-8);
  assert.ok(Math.abs(result.longitude - 79.0882) < 1e-8);
});

test('orthographic forward and inverse projections preserve surface positions', () => {
  const cases = [
    [0, 0, 0, 0],
    [21.1458, 79.0882, 25, 78],
    [35.6895, 139.6917, 38, 125],
    [-33.8688, 151.2093, -20, 140],
    [40.7128, -74.006, 35, -82]
  ];
  for (const [lat, lon, viewLat, viewLon] of cases) {
    const projected = projectLocation(lat, lon, viewLat, viewLon);
    assert.equal(projected.visible, true);
    const inverse = unprojectLocation(projected.x, projected.y, viewLat, viewLon);
    assert.ok(Math.abs(inverse.latitude - lat) < 0.00001);
    assert.ok(Math.abs(inverse.longitude - lon) < 0.00001);
  }
});

test('the far side of the earth is hidden', () => {
  assert.equal(projectLocation(0, 180, 0, 0).visible, false);
});

test('clicks outside the spherical disk are rejected', () => {
  assert.equal(unprojectLocation(0.9, 0.9, 0, 0), null);
});

test('latitude clamps and longitude wraps correctly', () => {
  assert.equal(clampLatitude(120), 90);
  assert.equal(clampLatitude(-120), -90);
  assert.equal(wrapLongitude(190), -170);
  assert.equal(wrapLongitude(-190), 170);
});

test('only valid NASA coordinates are accepted', () => {
  assert.deepEqual(normalizeLocation('21.1458', '79.0882'), { latitude: 21.1458, longitude: 79.0882 });
  assert.equal(normalizeLocation('x', '79'), null);
  assert.equal(normalizeLocation('91', '79'), null);
});
