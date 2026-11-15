import React from 'react';
import { Activity, Info } from 'lucide-react';

export default function ImageBrightnessTimeline({ brightness = [], currentTime, duration, onSeek }) {
  const data = Array.isArray(brightness) && brightness.length === 100 ? brightness : null;
  const safeDuration = Number(duration) > 0 ? Number(duration) : 45;
  const fraction = Math.max(0, Math.min(1, (Number(currentTime) || 0) / safeDuration));
  const points = data?.map((value, index) => `${index * (900 / 99)},${146 - Math.max(0, Math.min(1, value)) * 128}`).join(' ');

  const seek = event => {
    const rectangle = event.currentTarget.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (event.clientX - rectangle.left) / rectangle.width));
    onSeek(f * safeDuration);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DCD7CD] bg-[#FFFDF9] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCD7CD] pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#18181B]">
          <Activity className="h-4 w-4 text-[#0B3D91]" /> NASA STILL IMAGE — BRIGHTNESS PROFILE
        </h3>
        <span className="rounded-md bg-[#EFECE6] px-2 py-1 font-mono text-[10px] text-[#71717A]">100 VERTICAL SLICES</span>
      </div>
      {data ? (
        <svg viewBox="0 0 900 160" className="mt-4 h-36 w-full cursor-crosshair overflow-visible rounded-lg bg-[#FAF9F6]" preserveAspectRatio="none" onClick={seek} role="img" aria-label="Normalized image brightness across 100 horizontal positions; click to seek through the scan">
          {[0, 0.25, 0.5, 0.75, 1].map(value => (
            <line key={value} x1={0} y1={146 - value * 128} x2={900} y2={146 - value * 128} stroke="#DCD7CD" strokeWidth={1} />
          ))}
          <polyline points={points} fill="none" stroke="#0B3D91" strokeWidth={3} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <line x1={fraction * 900} y1={0} x2={fraction * 900} y2={160} stroke="#FC3D21" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <div className="mt-4 flex h-36 items-center justify-center rounded-lg bg-[#FAF9F6] text-xs text-[#71717A]">Analyzing this NASA still image…</div>
      )}
      <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#71717A]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Normalized brightness of the displayed image, not a physical quantity or a time series. The red marker indicates the artistic left-to-right scan position.
      </div>
    </section>
  );
}
