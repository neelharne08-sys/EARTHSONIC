import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Image as ImageIcon, Layers, Maximize2, ScanLine } from 'lucide-react';
import { getNasaStill } from '../services/nasaStills.mjs';

const formatSeconds = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remainder = (safe % 60).toFixed(1).padStart(4, '0');
  return `${String(minutes).padStart(2, '0')}:${remainder}`;
};

export default function EarthImageViewer({
  station,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  isLooping = true,
  overlayActive = true,
  onToggleOverlay
}) {
  const still = getNasaStill(station.id);
  const [imageSource, setImageSource] = useState(still?.local ?? '');
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef(null);
  const currentRef = useRef(currentTime);
  const callbacksRef = useRef({ onSeek, onPlayPause });
  currentRef.current = currentTime;
  callbacksRef.current = { onSeek, onPlayPause };

  useEffect(() => {
    setImageSource(still?.local ?? '');
    setImageError(!still);
  }, [station.id]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(0.25, Math.max(0, (now - previous) / 1000));
      previous = now;
      const length = Number(duration) > 0 ? Number(duration) : 45;
      const next = Math.max(0, currentRef.current) + delta;
      if (next >= length) {
        if (isLooping) {
          currentRef.current = 0;
          callbacksRef.current.onSeek(0);
        } else {
          currentRef.current = length;
          callbacksRef.current.onSeek(length);
          callbacksRef.current.onPlayPause();
        }
      } else {
        currentRef.current = next;
        callbacksRef.current.onSeek(next);
      }
    }, 90);
    return () => window.clearInterval(timer);
  }, [isPlaying, duration, isLooping]);

  function handleImageFailure() {
    if (still && imageSource === still.local) {
      setImageSource(still.remote);
    } else {
      setImageError(true);
    }
  }

  function seek(event) {
    if (!Number.isFinite(duration) || duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    callbacksRef.current.onSeek(fraction * duration);
  }

  const progress = Math.max(0, Math.min(100, (Number(currentTime) / (Number(duration) || 45)) * 100));

  return (
    <section id="earthsonic-image-viewer" className="overflow-hidden rounded-[28px] border border-[#DCD7CD] bg-[#FFFDF9] shadow-[0_20px_60px_rgba(24,24,27,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD7CD] bg-[#FAF9F6] px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
          <ImageIcon className="h-4 w-4 text-[#0B3D91]" />
          NASA SVS IMAGE VIEWER
          <span className="rounded-full bg-[#EFECE6] px-2 py-1 font-mono text-[10px] text-[#71717A]">STILL IMAGE</span>
        </div>
        <button type="button" onClick={onToggleOverlay} className="flex items-center gap-1.5 rounded-lg border border-[#DCD7CD] bg-white px-3 py-2 text-xs text-[#0B3D91]" aria-pressed={overlayActive}>
          <Layers className="h-3.5 w-3.5" /> Scan overlay: {overlayActive ? 'ON' : 'OFF'}
        </button>
      </div>
      <div ref={containerRef} className="relative aspect-video w-full overflow-hidden bg-[#080E1C]">
        {imageError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-sm text-white">
            <ImageIcon className="h-10 w-10 text-[#FC3D21]" />
            <p>The NASA still image could not be loaded.</p>
            {still && <a className="text-[#AFCBFF] underline" href={still.sourceUrl} target="_blank" rel="noopener noreferrer">Open official NASA source</a>}
          </div>
        ) : (
          <img src={imageSource} onError={handleImageFailure} alt={`NASA SVS image for ${station.shortName || station.title}`} className="h-full w-full object-contain" />
        )}
        {overlayActive && !imageError && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 w-[2px] motion-reduce:hidden bg-[#FC3D21] shadow-[0_0_14px_rgba(252,61,33,0.75)]" style={{ left: `${progress}%` }} />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-[#FAF9F6]/95 px-3 py-2 font-mono text-[10px] font-bold text-[#0B3D91]">
              <ScanLine className="h-3.5 w-3.5" /> IMAGE FEATURE SCAN — EARTHSONIC
            </div>
            <div className="absolute bottom-3 right-3 rounded-lg bg-[#FAF9F6]/95 px-3 py-2 font-mono text-[10px] font-semibold text-[#18181B]">
              SCAN {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </div>
          </div>
        )}
        <button type="button" title="Expand NASA still" className="absolute bottom-3 left-3 rounded-lg border border-white/30 bg-black/60 p-2 text-white" onClick={() => {
          const node = containerRef.current;
          if (!node) return;
          if (document.fullscreenElement) document.exitFullscreen?.();
          else node.requestFullscreen?.().catch(() => {});
        }}>
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2 pt-4">
        <button type="button" onClick={onPlayPause} className="rounded-xl bg-[#0B3D91] px-4 py-2.5 text-sm font-bold text-white">
          {isPlaying ? 'Pause scan & sound' : 'Play scan & sound'}
        </button>
        {still && <a href={still.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3D91] hover:underline">
          Original NASA SVS image <ExternalLink className="h-3.5 w-3.5" />
        </a>}
      </div>
      <div className="mx-4 mb-3 cursor-pointer rounded-full bg-[#EFECE6]" onClick={seek} role="slider" aria-label="Image scan position" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(currentTime)} tabIndex={0} onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          callbacksRef.current.onSeek(Math.min(duration, Math.max(0, currentTime + (event.key === 'ArrowRight' ? 1 : -1))));
        }
      }}>
        <div className="h-2 rounded-full bg-[#0B3D91] transition-[width] duration-75 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
      </div>
      <p className="px-4 pb-4 text-xs leading-5 text-[#71717A]">
        Source: NASA Scientific Visualization Studio. This is a still image, not a video. The scan sonifies normalized display-pixel brightness, not underlying calibrated physical measurements. NASA POWER climate sonification remains a separate feature.
      </p>
    </section>
  );
}
