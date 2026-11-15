import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Globe2,
  Headphones,
  Info,
  Play,
  Radio,
  ScanLine,
  Volume2,
  X
} from 'lucide-react';
import { getNasaStill } from '../services/nasaStills.mjs';
import { createImageScanWav, readImageSoundSample, validateImageAudio } from '../services/imageAudioExport.mjs';
import './EarthsonicEnhancements.css';

const GUIDE_STEPS = [
  {
    title: 'Start with an authentic NASA image',
    description: 'Every station references a NASA Scientific Visualization Studio page. Inspect the source, then notice that the image is a visualization, not a numerical sensor dataset.',
    action: 'Show NASA image source',
    target: 'earthsonic-source-provenance'
  },
  {
    title: 'Hear the image scan',
    description: 'Earthsonic scans the displayed image left to right. A darker normalized slice maps to a lower tone; a brighter slice maps to a higher tone.',
    action: 'Play the image sound',
    target: 'earthsonic-image-viewer'
  },
  {
    title: 'Explain one note using real numbers',
    description: 'The explanation card follows the active slice and displays the image-derived brightness and frequency, including the mapping formula.',
    action: 'Show the explanation',
    target: 'earthsonic-explain-sound'
  },
  {
    title: 'Compare with NASA climate measurements',
    description: 'NASA POWER temperature, relative humidity and wind are separate numerical measurements. Select a location and dates in the Scientific Jukebox to hear data-derived tones.',
    action: 'Open scientific climate controls',
    target: 'scientific-jukebox'
  }
];

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  return true;
}

function SourceProvenance({ station, still }) {
  return (
    <section id="earthsonic-source-provenance" className="ee48-card scroll-mt-28" aria-labelledby="ee48-provenance-title">
      <div className="ee48-heading">
        <Globe2 className="h-5 w-5 text-[#0B3D91]" />
        <h3 id="ee48-provenance-title">NASA source transparency</h3>
      </div>
      <div className="ee48-source-grid">
        <div>
          <span className="ee48-eyebrow">Image mode · NASA SVS</span>
          <p className="ee48-source-title">{still?.title ?? station.title}</p>
          <p className="ee48-help">{station.svsId} · Official scientific visualization still. The pixels are interpreted visually; they are not calibrated to a physical quantity by this audio mode.</p>
          {still && (
            <a className="ee48-link" href={still.sourceUrl} target="_blank" rel="noopener noreferrer">
              Open original NASA SVS page <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <div>
          <span className="ee48-eyebrow">Climate mode · NASA POWER</span>
          <p className="ee48-source-title">Daily meteorological measurements</p>
          <p className="ee48-help">T2M: 2 m air temperature (°C). RH2M: 2 m relative humidity (%). WS2M: 2 m wind speed (m/s). Select a location and dates in the scientific workstation.</p>
          <a className="ee48-link" href="https://power.larc.nasa.gov/" target="_blank" rel="noopener noreferrer">
            NASA POWER data portal <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      <p className="ee48-note"><Info className="h-4 w-4 shrink-0" /> NASA does not supply Earthsonic's generated musical audio. Image-scan sound is an artistic transformation of displayed image brightness. Climate tones are derived separately from numerical NASA POWER values.</p>
    </section>
  );
}

function ExplainSound({ reading, available, isPlaying, currentTime, duration }) {
  const pct = reading ? Math.round(reading.brightness * 1000) / 10 : null;
  const cursor = reading ? reading.slice : 0;
  return (
    <section id="earthsonic-explain-sound" className="ee48-card scroll-mt-28" aria-labelledby="ee48-explain-title">
      <div className="ee48-heading">
        <Activity className="h-5 w-5 text-[#0B3D91]" />
        <h3 id="ee48-explain-title">Explain this sound</h3>
        <span className="ee48-status">{isPlaying ? 'Scanning' : 'Paused'}</span>
      </div>
      {!available || !reading ? (
        <p className="ee48-empty">Waiting for local NASA image analysis. Download the ten NASA images if the station image cannot load. No substitute sensor values are shown.</p>
      ) : (
        <>
          <div className="ee48-metrics">
            <div className="ee48-metric"><span>Current image slice</span><strong>{cursor} <small>/ 100</small></strong></div>
            <div className="ee48-metric"><span>Normalized brightness</span><strong>{reading.brightness.toFixed(3)} <small>({pct}%)</small></strong></div>
            <div className="ee48-metric"><span>Generated pitch</span><strong>{reading.frequency.toFixed(1)} <small>Hz</small></strong></div>
          </div>
          <div className="ee48-meter" role="img" aria-label={`Image scan ${cursor} of 100, normalized brightness ${pct} percent`}>
            <div style={{ width: `${pct}%` }} />
          </div>
          <p className="ee48-help">Pitch = 180 + (580 × normalized brightness). Displayed brightness is normalized separately for each image; this number is not forest height, temperature, pollution or another physical measurement.</p>
          <p className="ee48-note"><ScanLine className="h-4 w-4 shrink-0" /> The scan position ({(Number(currentTime) || 0).toFixed(1)} / {(Number(duration) || 45).toFixed(1)} seconds) represents an artistic journey across the still image, not an observation timestamp.</p>
        </>
      )}
    </section>
  );
}

function GuidedTour({ available, isPlaying, onPlayPause, onSeek }) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hint, setHint] = useState('');
  const step = GUIDE_STEPS[stepIndex];
  function runAction() {
    if (stepIndex === 1) {
      if (!available) {
        setHint('NASA image analysis is not ready. Check the image files before starting audio.');
        return;
      }
      if (!isPlaying) {
        onSeek(0);
        onPlayPause();
      }
    }
    if (!scrollToSection(step.target)) setHint('This section is not available on this page.');
    else setHint('');
  }
  return (
    <section className="ee48-tour" aria-label="Earthsonic guided demonstration">
      <div className="ee48-tour-intro">
        <div>
          <span className="ee48-eyebrow">GUIDED DEMONSTRATION</span>
          <h2>See the source. Hear the science.</h2>
          <p>Four short stops explain exactly where NASA information ends and Earthsonic's generated sound begins.</p>
        </div>
        <button type="button" className="ee48-primary" onClick={() => { setOpen(true); setStepIndex(0); setHint(''); }}>
          <Play className="h-4 w-4" /> Start guided demo
        </button>
      </div>
      {open && (
        <div className="ee48-tour-stage" role="region" aria-label="Guided Earthsonic demo steps">
          <div className="ee48-tour-stage-top">
            <span>Step {stepIndex + 1} of {GUIDE_STEPS.length}</span>
            <button type="button" className="ee48-icon-button" aria-label="Close guided demo" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
          </div>
          <div className="ee48-step-markers" aria-hidden="true">
            {GUIDE_STEPS.map((entry, i) => <div key={entry.title} className={i <= stepIndex ? 'is-completed' : ''} />)}
          </div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
          <div className="ee48-tour-actions">
            <button type="button" className="ee48-secondary" onClick={() => setStepIndex(i => Math.max(0, i - 1))} disabled={stepIndex === 0}><ChevronLeft className="h-4 w-4" /> Back</button>
            <button type="button" className="ee48-action" onClick={runAction}>{step.action} <ArrowRight className="h-4 w-4" /></button>
            {stepIndex === GUIDE_STEPS.length - 1 ? (
              <button type="button" className="ee48-secondary" onClick={() => setOpen(false)}><CheckCircle2 className="h-4 w-4" /> Finish</button>
            ) : (
              <button type="button" className="ee48-secondary" onClick={() => { setHint(''); setStepIndex(i => i + 1); }}>Next <ChevronRight className="h-4 w-4" /></button>
            )}
          </div>
          {hint && <p className="ee48-help" role="status">{hint}</p>}
        </div>
      )}
    </section>
  );
}

function ExportAudio({ station, analysis, duration }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const available = useMemo(() => {
    try { validateImageAudio(analysis); return true; }
    catch { return false; }
  }, [analysis]);
  useEffect(() => { setStatus(''); setBusy(false); }, [station.id]);
  function download() {
    if (!available || busy) return;
    setBusy(true);
    try {
      const wav = createImageScanWav(analysis, { durationSeconds: Number(duration) > 0 ? Number(duration) : 45, sampleRate: 16000 });
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Earthsonic_${station.id}_image_scan.wav`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus('WAV generated. Check your browser downloads.');
    } catch (error) {
      setStatus(error?.message || 'Unable to generate WAV audio.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ee48-card" aria-labelledby="ee48-export-title">
      <div className="ee48-heading"><Headphones className="h-5 w-5 text-[#0B3D91]" /><h3 id="ee48-export-title">Export this sound</h3></div>
      <p className="ee48-help">Download a 16-bit mono WAV of the generated image-scan tone using this station's 100 analyzed slices. No recording is fetched from NASA.</p>
      <button type="button" className="ee48-primary ee48-download" disabled={!available || busy} onClick={download}><Download className="h-4 w-4" /> {busy ? 'Generating WAV…' : 'Download image-scan WAV'}</button>
      <p className="ee48-note"><Info className="h-4 w-4 shrink-0" /> This WAV approximates the image-scan oscillator only; it does not include station narration, other mixer tracks, or the NASA POWER climate soundtrack.</p>
      {status && <p className="ee48-help" role="status">{status}</p>}
    </section>
  );
}

function AccessibleCaptions({ station, reading, available, isPlaying }) {
  const [showCaptions, setShowCaptions] = useState(true);
  const [announce, setAnnounce] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const decile = reading ? Math.floor((reading.slice - 1) / 10) : -1;
  useEffect(() => {
    if (!announce || !available || !reading) return;
    setAnnouncement(`${station.shortName || station.title}: scan segment ${decile + 1} of 10. Image brightness ${(reading.brightness * 100).toFixed(0)} percent, generated pitch ${reading.frequency.toFixed(0)} hertz.`);
  }, [announce, available, decile, station.id]);
  useEffect(() => { setAnnouncement(''); }, [station.id]);
  const description = !available || !reading
    ? 'Waiting for local image analysis. No audio data is available yet.'
    : `Station ${station.shortName || station.title}. ${isPlaying ? 'Image scan playing.' : 'Image scan paused.'} Slice ${reading.slice} of 100. Normalized brightness ${Math.round(reading.brightness * 100)} percent. Image-derived tone ${reading.frequency.toFixed(0)} hertz.`;
  return (
    <section className="ee48-card" aria-labelledby="ee48-access-title">
      <div className="ee48-heading"><Eye className="h-5 w-5 text-[#0B3D91]" /><h3 id="ee48-access-title">Accessible sound experience</h3></div>
      <div className="ee48-switches">
        <button type="button" aria-pressed={showCaptions} className={showCaptions ? 'ee48-switch is-on' : 'ee48-switch'} onClick={() => setShowCaptions(v => !v)}>
          <BookOpen className="h-4 w-4" /> Text captions {showCaptions ? 'ON' : 'OFF'}
        </button>
        <button type="button" aria-pressed={announce} className={announce ? 'ee48-switch is-on' : 'ee48-switch'} onClick={() => { setAnnounce(v => !v); setAnnouncement(''); }}>
          <Volume2 className="h-4 w-4" /> Screen-reader updates {announce ? 'ON' : 'OFF'}
        </button>
      </div>
      {showCaptions && <p className="ee48-caption"><Radio className="h-4 w-4 shrink-0" /> {description}</p>}
      <span className="sr-only" role="status" aria-live={announce ? 'polite' : 'off'} aria-atomic="true">{announce ? announcement : ''}</span>
      <p className="ee48-help">The existing brightness chart provides a visual equivalent. Use Tab, Enter, and arrow keys for keyboard navigation. Reduced-motion preferences disable nonessential transitions in this panel.</p>
    </section>
  );
}

export default function EarthsonicEnhancements({ station, analysis, currentTime, duration, isPlaying, onPlayPause, onSeek }) {
  const still = getNasaStill(station.id);
  const reading = readImageSoundSample(analysis, currentTime, duration);
  const available = Boolean(reading);
  return (
    <div className="earthsonic-enhancements" aria-label="Earthsonic source and audio learning tools">
      <GuidedTour available={available} isPlaying={isPlaying} onPlayPause={onPlayPause} onSeek={onSeek} />
      <div className="ee48-two-columns">
        <ExplainSound reading={reading} available={available} isPlaying={isPlaying} currentTime={currentTime} duration={duration} />
        <SourceProvenance station={station} still={still} />
      </div>
      <div className="ee48-two-columns">
        <ExportAudio station={station} analysis={analysis} duration={duration} />
        <AccessibleCaptions station={station} reading={reading} available={available} isPlaying={isPlaying} />
      </div>
    </div>
  );
}
