import React, { useEffect, useRef, useState } from 'react';
import GlobeLocationPicker from './GlobeLocationPicker';
import { Activity, CalendarDays, ExternalLink, Loader2, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX, Wind } from 'lucide-react';
import {
  SCIENCE_DAY_SECONDS,
  SCIENCE_LAYERS,
  layerLevel,
  scheduleClimateAudio,
  validateClimateResponse
} from '../services/scientificPlayback';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

const INITIAL_VOLUMES = {
  temperature_c: 75,
  relative_humidity_pct: 55,
  wind_speed_mps: 60
};

function measurementLabel(value, unit) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(2)} ${unit}`
    : 'Missing';
}

function chartSegments(samples, field) {
  const segments = [];
  let segment = [];
  samples.forEach((sample, index) => {
    const value = sample.sonification?.[field]?.normalized;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      if (segment.length) segments.push(segment.join(' '));
      segment = [];
      return;
    }
    const x = samples.length === 1 ? 400 : 15 + index * 770 / (samples.length - 1);
    segment.push(`${x.toFixed(1)},${(150 - Math.max(0, Math.min(1, value)) * 130).toFixed(1)}`);
  });
  if (segment.length) segments.push(segment.join(' '));
  return segments;
}

export default function ScientificJukebox({ onSciencePlay, stopSignal = 0 }) {
  const [latitude, setLatitude] = useState('21.1458');
  const [longitude, setLongitude] = useState('79.0882');
  const [start, setStart] = useState('2025-01-01');
  const [end, setEnd] = useState('2025-01-07');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [masterVolume, setMasterVolume] = useState(75);
  const [volumes, setVolumes] = useState(INITIAL_VOLUMES);
  const [muted, setMuted] = useState({});
  const playbackRef = useRef(null);
  const playbackTokenRef = useRef(0);
  const fetchRef = useRef(null);
  const requestTokenRef = useRef(0);

  function releasePlayback() {
    playbackTokenRef.current += 1;
    const session = playbackRef.current;
    playbackRef.current = null;
    if (!session) return;
    if (session.frame !== null) cancelAnimationFrame(session.frame);
    if (session.context.state !== 'closed') session.context.close().catch(() => {});
  }

  function stopPlayback(reset = false) {
    releasePlayback();
    setPlaying(false);
    if (reset) setActiveDay(0);
  }

  useEffect(() => {
    return () => {
      requestTokenRef.current += 1;
      fetchRef.current?.abort();
      releasePlayback();
    };
  }, []);

  useEffect(() => {
    stopPlayback();
  }, [stopSignal]);

  useEffect(() => {
    const session = playbackRef.current;
    if (!session?.master) return;
    const at = session.context.currentTime;
    session.master.gain.setTargetAtTime(masterVolume / 100, at, 0.03);
    for (const layer of SCIENCE_LAYERS) {
      session.gains[layer.id].gain.setTargetAtTime(
        layerLevel(volumes[layer.id], Boolean(muted[layer.id])), at, 0.03
      );
    }
  }, [masterVolume, volumes, muted]);

  async function loadData(event) {
    event.preventDefault();
    stopPlayback(true);
    fetchRef.current?.abort();
    const controller = new AbortController();
    const requestId = ++requestTokenRef.current;
    fetchRef.current = controller;
    setResult(null);
    setError('');
    setLoading(true);

    const query = new URLSearchParams({
      latitude,
      longitude,
      start: start.replaceAll('-', ''),
      end: end.replaceAll('-', '')
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/science/climate?${query}`, {
        signal: controller.signal,
        credentials: 'include'
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof body?.detail === 'string'
          ? body.detail
          : `NASA climate request failed (HTTP ${response.status})`);
      }
      validateClimateResponse(body);
      if (requestId === requestTokenRef.current) setResult(body);
    } catch (issue) {
      if (requestId === requestTokenRef.current && issue.name !== 'AbortError') {
        setError(issue.message || 'Unable to retrieve NASA climate data.');
      }
    } finally {
      if (requestId === requestTokenRef.current) setLoading(false);
    }
  }

  async function startPlayback(fromIndex) {
    const samples = result?.data?.samples;
    if (!samples?.length) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setError('Web Audio is unavailable in this browser.');
      return;
    }

    releasePlayback();
    const token = playbackTokenRef.current;
    let context;
    try {
      context = new AudioContextClass();
    } catch (issue) {
      setError(issue.message || 'Web Audio could not initialize.');
      return;
    }
    const session = { context, frame: null, master: null, gains: {}, token };
    playbackRef.current = session;
    setError('');

    try {
      await context.resume();
      if (playbackRef.current !== session) return;
      onSciencePlay?.();

      const master = context.createGain();
      master.gain.setValueAtTime(masterVolume / 100, context.currentTime);
      master.connect(context.destination);
      session.master = master;

      for (const layer of SCIENCE_LAYERS) {
        const gain = context.createGain();
        gain.gain.setValueAtTime(layerLevel(volumes[layer.id], Boolean(muted[layer.id])), context.currentTime);
        gain.connect(master);
        session.gains[layer.id] = gain;
      }

      const begins = context.currentTime + 0.15;
      scheduleClimateAudio(context, session.gains, samples, fromIndex, begins);
      setActiveDay(fromIndex);
      setPlaying(true);

      const endAt = begins + (samples.length - fromIndex) * SCIENCE_DAY_SECONDS;
      const updateTimeline = () => {
        if (playbackRef.current !== session || playbackTokenRef.current !== token) return;
        if (context.currentTime >= endAt) {
          stopPlayback(true);
          return;
        }
        if (context.currentTime >= begins) {
          const index = Math.min(samples.length - 1,
            fromIndex + Math.floor((context.currentTime - begins) / SCIENCE_DAY_SECONDS));
          setActiveDay(current => current === index ? current : index);
        }
        session.frame = requestAnimationFrame(updateTimeline);
      };
      session.frame = requestAnimationFrame(updateTimeline);
    } catch (issue) {
      if (playbackRef.current === session) {
        stopPlayback();
        setError(issue.message || 'Scientific audio playback could not start.');
      }
    }
  }

  function seekTo(index) {
    const samples = result?.data?.samples || [];
    if (!samples.length) return;
    const target = Math.max(0, Math.min(samples.length - 1, Number(index)));
    if (playbackRef.current) {
      startPlayback(target);
    } else {
      setActiveDay(target);
    }
  }

  const samples = result?.data?.samples || [];
  const current = samples[activeDay] || null;

  return (
    <section id="scientific-jukebox" aria-label="Scientific NASA audio workstation" className="editorial-science rounded-2xl border border-[#DCD7CD]/70 bg-gradient-to-br from-[#FFFDF9] via-[#FAF9F6] to-[#EFECE6] p-5 text-[#18181B] shadow-xl sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D97706]">
            <Activity className="h-4 w-4" /> Earthsonic · Scientific Jukebox
          </div>
          <h2 className="mt-2 text-2xl font-bold">Hear NASA Climate Data</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#71717A]">
            Temperature, humidity, and wind are generated as separate sound layers from NASA POWER daily values. The playhead follows the actual date being sonified.
          </p>
          <p className="mt-2 text-xs text-[#D97706]/90">
            This independent scientific dataset uses your chosen coordinates and dates; it is not data attributed to the selected SVS video station.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DCD7CD]/70 bg-[#EFECE6]/95 text-[#D97706]"><Wind className="h-5 w-5" /></div>
      </div>

      <GlobeLocationPicker
        latitude={latitude}
        longitude={longitude}
        onChange={({ latitude: nextLatitude, longitude: nextLongitude }) => {
          setLatitude(nextLatitude);
          setLongitude(nextLongitude);
        }}
      />

      <form onSubmit={loadData} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-medium text-[#71717A]">Start date (UTC)
          <input required aria-label="Scientific start date" type="date" value={start} onChange={event => setStart(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#DCD7CD] bg-[#EFECE6] px-3 py-2.5 text-sm text-[#18181B]" />
        </label>
        <label className="text-xs font-medium text-[#71717A]">End date (UTC)
          <input required aria-label="Scientific end date" type="date" value={end} onChange={event => setEnd(event.target.value)} className="mt-1 block w-full rounded-lg border border-[#DCD7CD] bg-[#EFECE6] px-3 py-2.5 text-sm text-[#18181B]" />
        </label>
        <button type="submit" disabled={loading} className="flex min-h-11 items-center justify-center gap-2 self-end rounded-lg bg-[#EFECE6] px-4 py-2.5 text-sm font-bold text-[#D97706] transition hover:bg-[#EFECE6] disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
          {loading ? 'Loading NASA...' : 'Load scientific data'}
        </button>
      </form>

      {error && <div role="alert" className="mt-4 rounded-lg border border-[#DCD7CD]/80 bg-[#EFECE6]/95 p-3 text-sm text-[#FC3D21]">{error}</div>}

      {result && <div className="mt-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCD7CD]/70 bg-[#EFECE6] p-4">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-xs uppercase tracking-wide text-[#71717A]">Scientific playhead · Day {activeDay + 1} of {samples.length}</p>
            <p className="mt-1 text-xl font-bold text-[#D97706]">{current?.date}</p>
            <p className="mt-1 text-xs text-[#71717A]">{playing ? 'Playing mapped NASA measurements' : 'Ready to play from this date'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Previous scientific day" disabled={activeDay === 0} onClick={() => seekTo(activeDay - 1)} className="rounded-lg border border-[#DCD7CD] p-2.5 text-[#18181B] disabled:opacity-40"><SkipBack className="h-4 w-4" /></button>
            <button type="button" onClick={() => playing ? stopPlayback() : startPlayback(activeDay)} className="flex items-center gap-2 rounded-lg bg-[#EFECE6] px-5 py-2.5 text-sm font-bold text-[#D97706]">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'Pause' : activeDay ? 'Resume' : 'Play NASA data'}
            </button>
            <button type="button" aria-label="Next scientific day" disabled={activeDay >= samples.length - 1} onClick={() => seekTo(activeDay + 1)} className="rounded-lg border border-[#DCD7CD] p-2.5 text-[#18181B] disabled:opacity-40"><SkipForward className="h-4 w-4" /></button>
            <button type="button" aria-label="Reset scientific playback" onClick={() => stopPlayback(true)} className="rounded-lg border border-[#DCD7CD] p-2.5 text-[#18181B]"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        <label className="block text-xs text-[#71717A]">Timeline — select any NASA day
          <input type="range" aria-label="Scientific timeline day" min="0" max={Math.max(0, samples.length - 1)} step="1" value={activeDay} onChange={event => seekTo(Number(event.target.value))} className="mt-2 w-full accent-[#0B3D91]" />
        </label>
        <div className="flex justify-between text-[11px] text-[#71717A]"><span>{samples[0]?.date}</span><span>{samples[samples.length - 1]?.date}</span></div>

        <div className="grid gap-3 md:grid-cols-3">
          {SCIENCE_LAYERS.map(layer => {
            const value = current?.measurements?.[layer.id];
            const pitch = current?.sonification?.[layer.id]?.frequency_hz;
            const isMuted = Boolean(muted[layer.id]);
            return <div key={layer.id} className="rounded-xl border border-[#DCD7CD] bg-[#EFECE6] p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: layer.color }} />{layer.label}</h3>
                <button type="button" aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${layer.label}`} onClick={() => setMuted(previous => ({ ...previous, [layer.id]: !previous[layer.id] }))} className="rounded-lg border border-[#DCD7CD] p-2 text-[#18181B]">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-3 text-lg font-bold">{measurementLabel(value, layer.unit)}</p>
              <p className="mt-1 text-xs text-[#71717A]">{typeof pitch === 'number' ? `${pitch.toFixed(2)} Hz generated pitch` : 'No reading · silent layer'}</p>
              <label className="mt-4 block text-xs text-[#71717A]">Layer volume · {volumes[layer.id]}%
                <input aria-label={`${layer.label} layer volume`} type="range" min="0" max="100" step="1" value={volumes[layer.id]} onChange={event => setVolumes(previous => ({ ...previous, [layer.id]: Number(event.target.value) }))} className="mt-2 w-full accent-[#0B3D91]" />
              </label>
            </div>;
          })}
        </div>

        <div className="rounded-xl border border-[#DCD7CD] bg-[#EFECE6] p-4">
          <label className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#71717A]">Scientific master volume
            <span className="font-semibold text-[#D97706]">{masterVolume}%</span>
          </label>
          <input type="range" aria-label="Scientific master volume" min="0" max="100" step="1" value={masterVolume} onChange={event => setMasterVolume(Number(event.target.value))} className="mt-2 w-full accent-[#0B3D91]" />
          <p className="mt-2 text-xs text-[#71717A]">These science sliders control only NASA-data playback; your saved station mixes are unchanged.</p>
        </div>

        <div className="rounded-xl border border-[#DCD7CD] bg-[#EFECE6] p-4">
          <h3 className="mb-2 text-sm font-semibold">NASA data timeline · independently normalized tracks</h3>
          <svg role="img" aria-label="Three NASA climate variables across the selected days" viewBox="0 0 800 164" preserveAspectRatio="none" className="h-36 w-full">
            <path d="M0 150 H800 M0 20 H800" fill="none" stroke="#0B3D91" strokeDasharray="5 6" />
            {SCIENCE_LAYERS.flatMap(layer => chartSegments(samples, layer.id).map((segment, index) => <polyline key={`${layer.id}-${index}`} points={segment} fill="none" stroke={layer.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />))}
            <line x1={samples.length === 1 ? 400 : 15 + activeDay * 770 / (samples.length - 1)} y1="0" x2={samples.length === 1 ? 400 : 15 + activeDay * 770 / (samples.length - 1)} y2="155" stroke="white" strokeWidth="1.5" strokeDasharray="3 4" />
          </svg>
          <p className="mt-2 text-xs text-[#71717A]">Each colored line uses its own documented 0–1 artistic normalization, not a shared physical measurement scale.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#71717A]">
          <p>NASA POWER modeled/gridded daily data · {result.data.complete_days}/{result.data.sample_count} fully measured days · missing measurements are silent.</p>
          <a href={result.source.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#D97706] underline underline-offset-4"><ExternalLink className="h-3.5 w-3.5" /> View NASA source data</a>
        </div>
      </div>}

      {!result && !error && <p className="mt-4 text-xs text-[#71717A]">Choose a coordinate and up to 31 days, then load NASA POWER data. This mode makes no simulated fallback claims.</p>}
    </section>
  );
}
