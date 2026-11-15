import React, { useEffect, useRef, useState } from 'react';
import GlobeLocationPicker from './GlobeLocationPicker';
import { Activity, Globe2, Loader2, Pause, Play, RefreshCw, Thermometer } from 'lucide-react';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

export default function NASATemperatureLab() {
  const [latitude, setLatitude] = useState('0');
  const [longitude, setLongitude] = useState('0');
  const [start, setStart] = useState('2025-01-01');
  const [end, setEnd] = useState('2025-01-14');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const contextRef = useRef(null);
  const playbackId = useRef(0);
  const timerRef = useRef(null);
  const requestId = useRef(0);

  function stopAudio() {
    playbackId.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== 'closed') {
      context.close().catch(() => {});
    }
    setPlaying(false);
  }

  useEffect(() => {
    return () => {
      requestId.current += 1;
      playbackId.current += 1;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (contextRef.current && contextRef.current.state !== 'closed') {
        contextRef.current.close().catch(() => {});
      }
      contextRef.current = null;
    };
  }, []);

  async function loadMeasurements(event) {
    event?.preventDefault();
    stopAudio();
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    setResult(null);

    const query = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      start: start.replace(/-/g, ''),
      end: end.replace(/-/g, '')
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/science/temperature?${query}`, { credentials: 'include' });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof body?.detail === 'string' ? body.detail : `NASA data request failed (${response.status})`);
      }
      if (id === requestId.current) setResult(body);
    } catch (issue) {
      if (id === requestId.current) {
        setError(issue.message || 'Unable to load NASA POWER data.');
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  async function playData() {
    if (playing) {
      stopAudio();
      return;
    }
    const samples = result?.data?.samples || [];
    if (!samples.length) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setError('Your browser does not support Web Audio playback.');
      return;
    }

    const playId = ++playbackId.current;
    const context = new AudioContextClass();
    contextRef.current = context;
    try {
      await context.resume();
      if (playbackId.current !== playId) return;
      const noteLength = 0.24;
      const begin = context.currentTime + 0.05;
      samples.forEach((sample, index) => {
        const noteStart = begin + index * noteLength;
        const tone = context.createOscillator();
        const volume = context.createGain();
        tone.type = 'sine';
        tone.frequency.setValueAtTime(sample.frequency_hz, noteStart);
        volume.gain.setValueAtTime(0.0001, noteStart);
        volume.gain.exponentialRampToValueAtTime(0.07, noteStart + 0.016);
        volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteLength * 0.9);
        tone.connect(volume);
        volume.connect(context.destination);
        tone.start(noteStart);
        tone.stop(noteStart + noteLength);
      });
      setPlaying(true);
      timerRef.current = setTimeout(() => {
        if (playbackId.current === playId) stopAudio();
      }, Math.ceil((samples.length * noteLength + 0.3) * 1000));
    } catch (issue) {
      if (playbackId.current === playId) {
        stopAudio();
        setError(issue.message || 'Audio playback could not start.');
      }
    }
  }

  const samples = result?.data?.samples || [];
  const points = samples.map((sample, index) => {
    const x = samples.length === 1 ? 400 : 10 + (780 * index) / (samples.length - 1);
    const y = 150 - 130 * sample.normalized;
    return `${x},${y}`;
  }).join(' ');

  return (
    <section className="rounded-2xl border border-[#DCD7CD] bg-gradient-to-br from-[#FFFDF9] to-[#EFECE6] p-5 sm:p-7" aria-label="NASA POWER science lab">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#D97706]">
            <Activity className="h-4 w-4" /> SCIENCE LAB · REAL NASA DATA
          </div>
          <h2 className="mt-2 text-xl font-bold text-[#18181B] sm:text-2xl">Listen to Earth’s Daily Temperature</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71717A]">NASA POWER T2M supplies modeled daily 2-meter air temperatures (°C). Earthsonic transforms those numbers into musical pitches.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFECE6]/95 text-[#D97706]">
          <Globe2 className="h-6 w-6" />
        </div>
      </div>

      <GlobeLocationPicker
        latitude={latitude}
        longitude={longitude}
        onChange={({ latitude: nextLatitude, longitude: nextLongitude }) => {
          setLatitude(nextLatitude);
          setLongitude(nextLongitude);
        }}
      />

      <form onSubmit={loadMeasurements} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs text-[#71717A]">From (UTC)
          <input aria-label="Start date" required type="date" value={start} onChange={(event) => setStart(event.target.value)} className="mt-1 w-full rounded-lg border border-[#DCD7CD] bg-[#EFECE6] px-3 py-2.5 text-[#18181B]" />
        </label>
        <label className="text-xs text-[#71717A]">To (UTC)
          <input aria-label="End date" required type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="mt-1 w-full rounded-lg border border-[#DCD7CD] bg-[#EFECE6] px-3 py-2.5 text-[#18181B]" />
        </label>
        <button disabled={loading} type="submit" className="flex min-h-11 items-center justify-center gap-2 self-end rounded-lg bg-[#EFECE6] px-4 py-2.5 text-sm font-bold text-[#D97706] disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? 'Loading NASA...' : 'Load NASA Data'}
        </button>
      </form>

      {error && <p role="alert" className="mt-4 rounded-lg border border-[#DCD7CD]/80 bg-[#EFECE6]/95 p-3 text-sm text-[#FC3D21]">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Daily samples', result.data.sample_count, 'days'],
              ['Mean temperature', result.data.temperature_mean_c, '°C'],
              ['Temperature range', `${result.data.temperature_min_c}–${result.data.temperature_max_c}`, '°C']
            ].map(([title, value, unit]) => (
              <div key={title} className="rounded-xl border border-[#DCD7CD] bg-[#EFECE6] p-4">
                <p className="text-xs text-[#71717A]">{title}</p>
                <p className="mt-2 text-xl font-bold text-[#18181B]">{value} <span className="text-xs text-[#D97706]">{unit}</span></p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[#DCD7CD] bg-[#EFECE6] p-3 sm:p-5">
            <div className="flex items-center justify-between gap-3 text-xs text-[#71717A]">
              <span>Temperature-to-pitch mapping</span><Thermometer className="h-4 w-4 text-[#D97706]" />
            </div>
            <svg aria-label="Line chart of NASA daily temperature normalized to pitch" role="img" className="mt-3 h-36 w-full" viewBox="0 0 800 160" preserveAspectRatio="none">
              <path d="M0 150 H800" stroke="#0B3D91" strokeWidth="1" />
              <path d="M0 20 H800" stroke="#0B3D91" strokeDasharray="7 8" strokeWidth="1" />
              <polyline points={points} fill="none" stroke="#0B3D91" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {samples.map((sample, i) => {
                const x = samples.length === 1 ? 400 : 10 + (780 * i) / (samples.length - 1);
                return <circle key={sample.date} cx={x} cy={150 - 130 * sample.normalized} r="3" fill="#0B3D91" />;
              })}
            </svg>
            <p className="mt-1 text-xs text-[#71717A]">{result.period.start} to {result.period.end} · {result.data.missing_count} missing day(s)</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-xs leading-5 text-[#71717A]">Temperature is mapped from -20 to 50 °C into 220–880 Hz; out-of-range values are clipped. These sounds are generated by Earthsonic, not recordings from NASA.</p>
            <button type="button" onClick={playData} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] px-5 py-3 text-sm font-bold text-[#D97706]">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'Stop playback' : 'Play daily temperatures'}
            </button>
          </div>
          <a href={result.source.source_url} target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-[#D97706] underline underline-offset-4">View original NASA POWER API response</a>
        </div>
      )}
      {!result && !error && <p className="mt-5 text-xs text-[#71717A]">Choose a location and up to 31 days, then load the dataset. The sample starts at 0° latitude, 0° longitude and uses historical dates for reproducibility.</p>}
    </section>
  );
}
