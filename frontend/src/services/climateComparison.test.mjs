import test from 'node:test';
import assert from 'node:assert/strict';
import { alignSamples, buildClimateQuery, chartGeometry, makeCSV, summarize, validateDateRange, validLocation, validateClimatePayload } from './climateComparison.mjs';

const point = { latitude: 21.1458, longitude: 79.0882 };
const make = (samples) => ({ status: 'success', data: { samples: samples.map(([date, temperature_c, relative_humidity_pct, wind_speed_mps]) => ({
  date, measurements: {temperature_c, relative_humidity_pct, wind_speed_mps}, sonification: {}
})) }});
const left = make([['2025-01-01',20,55,3],['2025-01-02',null,59,4],['2025-01-03',22,61,5]]);
const right = make([['2025-01-01',10,30,1],['2025-01-02',11,40,null],['2025-01-03',12,50,2]]);

test('coordinates reject invalid or missing values', () => {
  assert.equal(validLocation('',1),false);
  assert.equal(validLocation(91,0),false);
  assert.equal(validLocation(-90,180),true);
  assert.equal(validLocation('NaN',0),false);
});
test('UTC dates validate actual calendar dates and 31-day limit', () => {
  assert.equal(validateDateRange('2025-01-01','2025-01-31'),31);
  assert.throws(()=>validateDateRange('2025-02-30','2025-03-03'));
  assert.throws(()=>validateDateRange('2025-01-31','2025-01-01'));
  assert.throws(()=>validateDateRange('2025-01-01','2025-02-01'));
  assert.throws(()=>validateDateRange('1980-12-31','1981-01-01'));
});
test('API query uses validated coordinates and compact UTC dates',()=>{
  const query = new URLSearchParams(buildClimateQuery(point,'2025-01-01','2025-01-03'));
  assert.equal(query.get('latitude'),'21.1458');
  assert.equal(query.get('start'),'20250101');
  assert.equal(query.get('end'),'20250103');
});
test('malformed NASA response is rejected',()=>{
  assert.throws(()=>validateClimatePayload({status:'error',data:{samples:[]}}));
  assert.throws(()=>validateClimatePayload(make([['not-a-date',20,50,4]])));
});
test('daily values align by UTC date without interpolation',()=>{
  const a = make([['2025-01-03',25,55,3]]);
  const b = make([['2025-01-01',14,66,4],['2025-01-03',15,65,5]]);
  const rows=alignSamples(a,b);
  assert.deepEqual(rows.map(r=>r.date),['2025-01-01','2025-01-03']);
  assert.equal(rows[0].a.temperature_c,undefined);
  assert.equal(rows[1].a.temperature_c,25);
});
test('averages omit missing values; delta is A minus B',()=>{
  const summary=summarize(alignSamples(left,right),'temperature_c');
  assert.equal(summary.averageA,21);
  assert.equal(summary.averageB,11);
  assert.equal(summary.difference,10);
  assert.equal(summary.samplesA,2);
});
test('chart paths break across missing days',()=>{
  const geo=chartGeometry(alignSamples(left,right),'temperature_c');
  assert.equal(geo.pathsA.length,2);
  assert.equal(geo.pathsB.length,1);
});
test('all missing values are not represented as zeros',()=>{
  const rows=alignSamples(make([['2025-01-01',null,null,null]]),make([['2025-01-01',null,null,null]]));
  const avg=summarize(rows,'temperature_c');
  assert.equal(avg.averageA,null);
  assert.equal(avg.difference,null);
  assert.equal(chartGeometry(rows,'temperature_c').pathsA.length,0);
});
test('CSV preserves empty measurements and includes units',()=>{
  const csv=makeCSV(alignSamples(left,right),'Nagpur','Tokyo');
  assert.match(csv,/Nagpur Temperature \(°C\)/);
  assert.match(csv,/"2025-01-02","","11"/);
});
