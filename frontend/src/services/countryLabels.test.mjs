import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRY_LABELS, getVisibleCountryLabels } from './countryLabels.mjs';

test('bundled country labels cover major world regions', () => {
  assert.ok(COUNTRY_LABELS.length > 100);
  for (const name of ['India', 'Brazil', 'Russia', 'China', 'Australia', 'Canada']) {
    assert.ok(COUNTRY_LABELS.some(country => country.name === name));
  }
});

test('all label anchors have valid coordinates', () => {
  for (const c of COUNTRY_LABELS) {
    assert.ok(c.latitude >= -90 && c.latitude <= 90);
    assert.ok(c.longitude >= -180 && c.longitude <= 180);
  }
});

test('visible labels are from front hemisphere only', () => {
  const shown = getVisibleCountryLabels(21, 79);
  assert.ok(shown.some(c => c.name === 'India'));
  assert.ok(shown.every(c => c.depth >= 0.36));
  assert.ok(shown.length <= 14);
});

test('rotating changes visible country labels', () => {
  const eastern = new Set(getVisibleCountryLabels(20, 90).map(c => c.name));
  const western = new Set(getVisibleCountryLabels(20, -90).map(c => c.name));
  assert.ok(eastern.has('India'));
  assert.ok(western.has('United States'));
  assert.ok(!western.has('India'));
});

test('empty maximum returns no labels', () => {
  assert.equal(getVisibleCountryLabels(0, 0, 0).length, 0);
});
