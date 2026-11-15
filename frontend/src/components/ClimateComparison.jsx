import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeftRight, AudioLines, Check, ChevronDown, Download, ExternalLink, Globe2, Headphones, Loader2, MapPin, Pause, Play, Search, Volume2 } from 'lucide-react';
import GlobeLocationPicker from './GlobeLocationPicker';
import { SCIENCE_DAY_SECONDS, SCIENCE_LAYERS, scheduleClimateAudio } from '../services/scientificPlayback';
import { alignSamples, buildClimateQuery, chartGeometry, CITY_PRESETS, COMPARISON_VARIABLES, isMeasurement, makeCSV, summarize, validateClimatePayload, validateDateRange } from '../services/climateComparison.mjs';
import './ClimateComparison.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const INITIAL_A = { ...CITY_PRESETS[0] };
const INITIAL_B = { ...CITY_PRESETS[1] };

function format(value, digits = 1) {
  return isMeasurement(value) ? value.toFixed(digits) : '—';
}

function axisLabel(date) {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function StatCard({ variable, summary }) {
  return (
    <article className="es-compare-stat">
      <p className="es-compare-stat__name">{variable.title} <span>({variable.unit})</span></p>
      <div className="es-compare-stat__values">
        <div><small>Location A</small><strong>{format(summary.averageA)}</strong></div>
        <div><small>Location B</small><strong>{format(summary.averageB)}</strong></div>
      </div>
      <div className="es-compare-stat__diff">
        <span>Mean difference (A − B)</span>
        <strong>{summary.difference === null ? 'No comparable average' : `${summary.difference >= 0 ? '+' : ''}${summary.difference.toFixed(2)} ${variable.unit}`}</strong>
      </div>
      <p className="es-compare-stat__coverage">Valid values: A {summary.samplesA} days · B {summary.samplesB} days</p>
    </article>
  );
}

function TrendChart({ rows, variable }) {
  const geometry = chartGeometry(rows, variable.id);
  const first = rows[0]?.date;
  const last = rows[rows.length - 1]?.date;
  const plotted = geometry.pathsA.length || geometry.pathsB.length;
  return (
    <div className="es-compare-chart" role="img" aria-label={`${variable.title} trend for both locations, from ${first} to ${last}. Missing values create gaps.`}>
      <div className="es-compare-chart__header"><strong>{variable.title} trend</strong><span>{variable.unit} · UTC daily measurements</span></div>
      {plotted ? (
        <svg viewBox="0 0 800 215" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
          {[32, 67.5, 103, 138.5, 174].map(y => <line key={y} x1="42" x2="758" y1={y} y2={y} stroke="#DFE3E8" strokeDasharray="4 6" strokeWidth="1"/>)}
          <text x="4" y="36" fill="#71717A" fontSize="13">{format(geometry.max)}</text>
          <text x="4" y="177" fill="#71717A" fontSize="13">{format(geometry.min)}</text>
          {geometry.pathsA.map((points, i) => points.split(' ').length === 1 ? <circle key={`a-${i}`} cx={Number(points.split(',')[0])} cy={Number(points.split(',')[1])} r="4" fill="#0B3D91"/> : <polyline key={`a-${i}`} fill="none" stroke="#0B3D91" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" points={points}/>)}
          {geometry.pathsB.map((points, i) => points.split(' ').length === 1 ? <circle key={`b-${i}`} cx={Number(points.split(',')[0])} cy={Number(points.split(',')[1])} r="4" fill="#FC3D21"/> : <polyline key={`b-${i}`} fill="none" stroke="#FC3D21" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" points={points}/>)}
          <text x="42" y="205" fill="#71717A" fontSize="13">{axisLabel(first)}</text>
          <text x="758" y="205" textAnchor="end" fill="#71717A" fontSize="13">{axisLabel(last)}</text>
        </svg>
      ) : <p className="es-compare-chart__empty">No valid values for this variable in the chosen period.</p>}
      <div className="es-compare-legend"><span><i className="es-compare-legend__a"/>Location A</span><span><i className="es-compare-legend__b"/>Location B</span></div>
    </div>
  );
}

export default function ClimateComparison({ stopSignal = 0, onSciencePlay }) {
  const [locationA, setLocationA] = useState(INITIAL_A);
  const [locationB, setLocationB] = useState(INITIAL_B);
  const [start, setStart] = useState('2025-01-01');
  const [end, setEnd] = useState('2025-01-07');
  const [activeGlobe, setActiveGlobe] = useState(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('temperature_c');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playingSide, setPlayingSide] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const requestRef = useRef(null);
  const requestIdRef = useRef(0);
  const playbackRef = useRef(null);
  const audioTokenRef = useRef(0);

  function stopAudio() {
    audioTokenRef.current += 1;
    const session = playbackRef.current;
    playbackRef.current = null;
    if (session?.frame != null) cancelAnimationFrame(session.frame);
    if (session?.context && session.context.state !== 'closed') session.context.close().catch(() => {});
    setPlayingSide(null);
  }

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      requestRef.current?.abort();
      audioTokenRef.current += 1;
      const session = playbackRef.current;
      playbackRef.current = null;
      if (session?.frame != null) cancelAnimationFrame(session.frame);
      if (session?.context && session.context.state !== 'closed') session.context.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    stopAudio();
  }, [stopSignal]);

  function invalidateComparison() {
    requestRef.current?.abort();
    requestIdRef.current += 1;
    setResult(null);
    setLoading(false);
    setError('');
    stopAudio();
  }

  function changePlace(side, place) {
    const normalized = { label: place.label || 'Selected coordinates', latitude: Number(place.latitude), longitude: Number(place.longitude) };
    if (side === 'a') setLocationA(normalized);
    else setLocationB(normalized);
    invalidateComparison();
  }

  function onGlobePick(side, place) {
    changePlace(side, { label: 'Point on Earth', latitude: place.latitude, longitude: place.longitude });
  }

  async function loadComparison(event) {
    event.preventDefault();
    stopAudio();
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const id = ++requestIdRef.current;
    setResult(null);
    setError('');
    setLoading(true);
    try {
      validateDateRange(start, end);
      const aQuery = buildClimateQuery(locationA, start, end);
      const bQuery = buildClimateQuery(locationB, start, end);
      const load = async query => {
        const response = await fetch(`${API_BASE}/api/science/climate?${query}`, { method: 'GET', credentials: 'include', signal: controller.signal, headers: { Accept: 'application/json' } });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          const description = typeof body?.detail === 'string' ? body.detail : `NASA POWER request failed (HTTP ${response.status}).`;
          throw new Error(response.status === 401 ? 'Session expired. Sign in again to load NASA data.' : description);
        }
        validateClimatePayload(body);
        return body;
      };
      const [a, b] = await Promise.all([load(aQuery), load(bQuery)]);
      if (id === requestIdRef.current) {
        setResult({ a, b, rows: alignSamples(a, b), placeA: { ...locationA }, placeB: { ...locationB } });
      }
    } catch (issue) {
      if (id === requestIdRef.current && issue.name !== 'AbortError') setError(issue.message || 'Unable to compare NASA POWER data.');
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }

  async function play(side) {
    if (!result) return;
    if (playingSide === side) { stopAudio(); return; }
    stopAudio();
    setError('');
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { setError('Web Audio is not supported in this browser.'); return; }
    let context;
    try { context = new AudioContextClass(); } catch (issue) { setError(issue.message || 'Unable to initialize Web Audio.'); return; }
    const session = { context, frame: null };
    playbackRef.current = session;
    const token = audioTokenRef.current;
    try {
      await context.resume();
      if (playbackRef.current !== session) return;
      onSciencePlay?.();
      const master = context.createGain();
      master.gain.setValueAtTime(0.65, context.currentTime);
      master.connect(context.destination);
      const gains = {};
      for (const layer of SCIENCE_LAYERS) {
        const gain = context.createGain();
        gain.gain.value = layer.id === 'temperature_c' ? 0.13 : 0.09;
        gain.connect(master);
        gains[layer.id] = gain;
      }
      const samples = result[side].data.samples;
      const begins = context.currentTime + 0.1;
      scheduleClimateAudio(context, gains, samples, 0, begins, SCIENCE_DAY_SECONDS);
      const endsAt = begins + samples.length * SCIENCE_DAY_SECONDS;
      setPlayingSide(side);
      setDayIndex(0);
      const tick = () => {
        if (playbackRef.current !== session || token !== audioTokenRef.current) return;
        if (context.currentTime >= endsAt) { stopAudio(); return; }
        if (context.currentTime >= begins) {
          const idx = Math.min(samples.length - 1, Math.floor((context.currentTime - begins) / SCIENCE_DAY_SECONDS));
          setDayIndex(previous => previous === idx ? previous : idx);
        }
        session.frame = requestAnimationFrame(tick);
      };
      session.frame = requestAnimationFrame(tick);
    } catch (issue) {
      if (playbackRef.current === session) { stopAudio(); setError(issue.message || 'Unable to play climate audio.'); }
    }
  }

  function saveCSV() {
    if (!result) return;
    const csv = makeCSV(result.rows, result.placeA.label, result.placeB.label);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earthsonic-climate-comparison-${start}-${end}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  const entries = result?.rows || [];
  const active = COMPARISON_VARIABLES.find(v => v.id === selectedVariable) || COMPARISON_VARIABLES[0];
  const selectors = [
    { side: 'a', point: locationA, query: searchA, setQuery: setSearchA, caption: 'LOCATION A', label: 'Cobalt blue' },
    { side: 'b', point: locationB, query: searchB, setQuery: setSearchB, caption: 'LOCATION B', label: 'NASA red' }
  ];

  return (
    <section id="earthsonic-climate-comparison" className="es-compare" aria-labelledby="es-compare-title">
      <div className="es-container">
        <div className="es-compare-heading">
          <div><p className="es-compare-kicker"><ArrowLeftRight size={15}/> NEW · TWO-LOCATION CLIMATE COMPARISON</p><h2 id="es-compare-title">One planet. Two soundscapes.</h2><p>Choose two places on Earth and compare the same days of NASA POWER temperature, humidity and wind. Listen to each location’s independently generated audio.</p></div>
          <span className="es-compare-source"><Check size={15}/> NASA POWER · daily gridded data</span>
        </div>
        <div className="es-compare-places">
          {selectors.map(({side, point, query, setQuery, caption, label}) => {
            const presets = CITY_PRESETS.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
            return (
              <div key={side} className={`es-compare-place es-compare-place--${side}`}>
                <div className="es-compare-place__top"><span>{caption}</span><small>{label}</small></div>
                <h3><MapPin size={20}/>{point.label}</h3>
                <p className="es-compare-coords">{Number(point.latitude).toFixed(4)}° lat · {Number(point.longitude).toFixed(4)}° lon</p>
                <label className="es-compare-search"><Search size={16}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search example cities" aria-label={`Search location ${side.toUpperCase()} presets`}/></label>
                <div className="es-compare-preset-list" aria-label={`Location ${side.toUpperCase()} examples`}>
                  {presets.length ? presets.map(place => <button type="button" key={place.label} onClick={() => {changePlace(side, place);setQuery('');}} aria-pressed={point.label === place.label}>{place.label}</button>) : <small>No preset matches. Choose any point on the globe.</small>}
                </div>
                <button type="button" className="es-compare-globe-button" aria-expanded={activeGlobe === side} onClick={() => setActiveGlobe(old => old === side ? null : side)}><Globe2 size={16}/>{activeGlobe === side ? 'Close Earth globe' : 'Choose any point on Earth'}<ChevronDown size={16}/></button>
              </div>
            );
          })}
        </div>
        {activeGlobe && <div className="es-compare-globe-panel"><GlobeLocationPicker title={`Set location ${activeGlobe.toUpperCase()} using Earth`} latitude={activeGlobe === 'a' ? locationA.latitude : locationB.latitude} longitude={activeGlobe === 'a' ? locationA.longitude : locationB.longitude} onChange={point => onGlobePick(activeGlobe, point)}/></div>}
        <form className="es-compare-period" onSubmit={loadComparison}>
          <div><label htmlFor="es-compare-start">Start date · UTC</label><input id="es-compare-start" type="date" required value={start} onChange={event => {setStart(event.target.value);invalidateComparison();}}/></div>
          <div><label htmlFor="es-compare-end">End date · UTC</label><input id="es-compare-end" type="date" required value={end} onChange={event => {setEnd(event.target.value);invalidateComparison();}}/></div>
          <button type="submit" disabled={loading}><Activity size={18}/>{loading ? 'Loading NASA data...' : 'Compare NASA climate'}{loading && <Loader2 className="es-compare-spinner" size={16}/>}</button>
        </form>
        <p className="es-compare-caption">Use 1–31 daily UTC dates. These are gridded meteorological estimates, not readings from local thermometers. NASA provides the data; Earthsonic creates the musical pitches.</p>
        {error && <p className="es-compare-error" role="alert">{error}</p>}
        {loading && <div className="es-compare-pending" role="status"><Loader2 size={19} className="es-compare-spinner"/> Retrieving two NASA POWER time series…</div>}
        {result && <div className="es-compare-results" aria-live="polite">
          <div className="es-compare-results__head"><div><p className="es-compare-kicker">COMPARISON READY · {entries.length} UTC DAYS</p><h3>{result.placeA.label} <ArrowLeftRight size={18}/> {result.placeB.label}</h3></div><button type="button" onClick={saveCSV}><Download size={17}/> Export CSV</button></div>
          <div className="es-compare-stats">{COMPARISON_VARIABLES.map(variable => <StatCard key={variable.id} variable={variable} summary={summarize(entries, variable.id)}/>)}</div>
          <div className="es-compare-plot-box"><div className="es-compare-variable-tabs" role="group" aria-label="Choose climate variable chart">{COMPARISON_VARIABLES.map(variable => <button type="button" key={variable.id} aria-pressed={variable.id === selectedVariable} onClick={() => setSelectedVariable(variable.id)}>{variable.title}</button>)}</div><TrendChart rows={entries} variable={active}/></div>
          <div className="es-compare-listen"><div><p className="es-compare-kicker"><Headphones size={16}/> HEAR THE DIFFERENCE</p><p>Listen to each location separately. Three synthesised layers use NASA temperature, humidity and wind measurements, with missing layers silent.</p>{playingSide && <small>Playing {playingSide.toUpperCase()} · {result[playingSide]?.data?.samples[dayIndex]?.date || ''} (UTC)</small>}</div><div className="es-compare-listen__buttons"><button type="button" onClick={() => play('a')}><span>{playingSide === 'a' ? <Pause size={16}/> : <Play size={16}/>}</span>{playingSide === 'a' ? 'Stop A' : 'Listen to A'}</button><button type="button" onClick={() => play('b')}><span>{playingSide === 'b' ? <Pause size={16}/> : <Play size={16}/>}</span>{playingSide === 'b' ? 'Stop B' : 'Listen to B'}</button></div></div>
          <details className="es-compare-table-details"><summary>View all daily measurements <ChevronDown size={18}/></summary><div className="es-compare-table-scroll"><table><thead><tr><th scope="col">Date UTC</th>{COMPARISON_VARIABLES.map(variable => <React.Fragment key={variable.id}><th scope="col">A · {variable.title} ({variable.unit})</th><th scope="col">B · {variable.title} ({variable.unit})</th></React.Fragment>)}</tr></thead><tbody>{entries.map(row => <tr key={row.date}><th scope="row">{row.date}</th>{COMPARISON_VARIABLES.map(variable => <React.Fragment key={variable.id}><td>{format(row.a[variable.id],2)}</td><td>{format(row.b[variable.id],2)}</td></React.Fragment>)}</tr>)}</tbody></table></div></details>
          <div className="es-compare-sources"><strong>Sources:</strong>{['a','b'].map(side => {const url=result[side]?.source?.source_url;return typeof url === 'string' && url.startsWith('https://power.larc.nasa.gov/') ? <a key={side} href={url} target="_blank" rel="noopener noreferrer">NASA POWER {side.toUpperCase()} <ExternalLink size={13}/></a> : null;})}</div>
        </div>}
      </div>
    </section>
  );
}
