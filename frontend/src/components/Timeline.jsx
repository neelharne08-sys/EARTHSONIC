import React, { useRef } from 'react';
import { Clock, Activity, Zap, Layers, Sparkles } from 'lucide-react';

export default function Timeline({
  station,
  timelineData,
  currentTime,
  duration,
  onSeek
}) {
  const containerRef = useRef(null);

  const handleScrub = (e) => {
    if (!containerRef.current || !duration) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl bg-[#FAF9F6] border border-[#DCD7CD] p-5 shadow-xl">
      
      {/* Timeline Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCD7CD]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D97706]" />
          <h4 className="text-sm font-bold text-[#18181B] font-mono uppercase tracking-wide">
            Precomputed Python JSON Timeline
          </h4>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
          <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
          <span>Synchronized to Video Frame Clock</span>
        </div>
      </div>

      {/* Scrubbable Timeline Track */}
      <div 
        ref={containerRef}
        onClick={handleScrub}
        className="relative h-20 w-full rounded-xl bg-[#EFECE6] border border-[#DCD7CD] cursor-pointer overflow-hidden group select-none"
        role="slider"
        aria-label="Synchronized Timeline Scrub"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
      >
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-full border-r border-[#DCD7CD] text-[9px] font-mono text-[#71717A] pl-1 pt-1">
              {i * 10}%
            </div>
          ))}
        </div>

        {/* Render Event Markers if ISS Lightning */}
        {station.id === 'iss-lightning' && timelineData?.events && (
          <div className="absolute inset-0 pointer-events-none">
            {timelineData.events.map((evt, idx) => {
              const leftPercent = (evt.time / duration) * 100;
              const isPast = evt.time <= currentTime;
              return (
                <div
                  key={idx}
                  className="absolute bottom-0 top-0 flex flex-col items-center justify-center transform -translate-x-1/2"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div 
                    className={`w-1 rounded-full transition-colors ${
                      isPast ? 'bg-[#EFECE6] shadow-glow-amber' : 'bg-[#EFECE6]'
                    }`}
                    style={{ height: `${Math.max(20, evt.intensity * 80)}%` }}
                  />
                  <div 
                    className={`w-2 h-2 rounded-full mb-1 ${
                      isPast ? 'bg-[#EFECE6] animate-ping' : 'bg-[#EFECE6]'
                    }`} 
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Render Multi-Layer Curves if GEOS Aerosols */}
        {station.id === 'geos-aerosols' && timelineData?.dataPoints && (
          <div className="absolute inset-0 flex items-end pointer-events-none opacity-70">
            {timelineData.dataPoints.map((pt, idx) => {
              const heightPercent = pt.dust * 70;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-[#EFECE6]/95 hover:bg-[#EFECE6]"
                  style={{ height: `${heightPercent}%` }}
                />
              );
            })}
          </div>
        )}

        {/* Current Playhead Scrubber */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-[#EFECE6] z-30 pointer-events-none shadow-[0_0_12px_#fff]"
          style={{ left: `${Math.min(100, progressPercent)}%` }}
        >
          <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-[#EFECE6] rounded-full border-2 border-[#DCD7CD] shadow-glow-cyan" />
          <div className="absolute -bottom-1 -translate-x-1/2 w-3 h-3 bg-[#EFECE6] rounded-full border-2 border-[#DCD7CD] shadow-glow-cyan" />
        </div>

        {/* Played Time Shade */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-[#EFECE6]/95 pointer-events-none border-r border-[#DCD7CD]/80"
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Timeline Footer Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs font-mono text-[#71717A] gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
            <span>Time Scrub</span>
          </span>
          <span className="text-[#71717A]">|</span>
          <span>Click anywhere to jump video & audio sync</span>
        </div>

        <div className="text-[#71717A] text-[11px]">
          Duration: <span className="text-[#18181B] font-bold">{duration.toFixed(1)}s</span>
        </div>
      </div>

    </div>
  );
}
