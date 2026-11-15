import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SCIENCE_DAY_SECONDS,
  SCIENCE_LAYERS,
  clampVolume,
  layerLevel,
  scheduleClimateAudio,
  validateClimateResponse
} from './scientificPlayback.js';

function sample(date, temperature = 440, humidity = 220, wind = 110) {
  return {
    date,
    measurements: { temperature_c: 22, relative_humidity_pct: 65, wind_speed_mps: 3 },
    sonification: {
      temperature_c: temperature === null ? null : { frequency_hz: temperature, normalized: 0.6 },
      relative_humidity_pct: humidity === null ? null : { frequency_hz: humidity, normalized: 0.5 },
      wind_speed_mps: wind === null ? null : { frequency_hz: wind, normalized: 0.3 }
    }
  };
}

function fakeAudioContext() {
  const notes = [];
  return {
    notes,
    createOscillator() {
      const note = { frequency: null, begin: null, end: null, type: null };
      notes.push(note);
      return {
        set type(value) { note.type = value; },
        frequency: { setValueAtTime(value) { note.frequency = value; } },
        connect() {},
        start(value) { note.begin = value; },
        stop(value) { note.end = value; }
      };
    },
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      };
    }
  };
}

const gains = Object.fromEntries(SCIENCE_LAYERS.map(layer => [layer.id, {}]));

test('three distinct science audio layers exist', () => {
  assert.deepEqual(SCIENCE_LAYERS.map(layer => layer.id), ['temperature_c', 'relative_humidity_pct', 'wind_speed_mps']);
});

test('volume safely clamps to 0–100', () => {
  assert.equal(clampVolume(-2), 0);
  assert.equal(clampVolume(101), 100);
  assert.equal(clampVolume('55'), 55);
  assert.equal(clampVolume(NaN), 0);
});

test('mute overrides any positive layer volume', () => {
  assert.equal(layerLevel(100, true), 0);
  assert.equal(layerLevel(100, false), 0.17);
});

test('climate response rejects fabricated empty timelines', () => {
  assert.throws(() => validateClimateResponse({ status: 'success', data: { samples: [] } }));
  assert.throws(() => validateClimateResponse({ status: 'success', data: { samples: new Array(32).fill(sample('2025-01-01')) } }));
});

test('valid samples are preserved without changing measured data', () => {
  const days = [sample('2025-01-01')];
  assert.equal(validateClimateResponse({ status: 'success', data: { samples: days } }), days);
});

test('scheduling three layers creates three time-aligned notes per day', () => {
  const context = fakeAudioContext();
  const days = [sample('2025-01-01'), sample('2025-01-02')];
  assert.equal(scheduleClimateAudio(context, gains, days, 0, 2), 6);
  assert.equal(context.notes.length, 6);
  assert.equal(context.notes[0].begin, 2);
  assert.equal(context.notes[3].begin, 2 + SCIENCE_DAY_SECONDS);
});

test('missing or invalid NASA readings stay silent', () => {
  const context = fakeAudioContext();
  const days = [sample('2025-01-01', null, NaN, 110)];
  assert.equal(scheduleClimateAudio(context, gains, days, 0, 0), 1);
  assert.equal(context.notes[0].frequency, 110);
});

test('seeking starts at the selected day and retains its actual frequency', () => {
  const context = fakeAudioContext();
  const days = [sample('2025-01-01', 440), sample('2025-01-02', 560), sample('2025-01-03', 660)];
  assert.equal(scheduleClimateAudio(context, gains, days, 1, 3), 6);
  assert.equal(context.notes[0].frequency, 560);
  assert.equal(context.notes[0].begin, 3);
});

test('invalid seek is rejected', () => {
  const context = fakeAudioContext();
  assert.throws(() => scheduleClimateAudio(context, gains, [sample('2025-01-01')], 1, 0), RangeError);
});
