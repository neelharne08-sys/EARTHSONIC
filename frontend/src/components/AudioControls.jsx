import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Sliders,
  Radio
} from 'lucide-react';

export default function AudioControls({
  isPlaying,
  onPlayPause,
  onReset,
  currentTime,
  duration,
  masterVolume,
  onMasterVolumeChange,
  isMuted,
  onToggleMute,
  isLooping,
  onToggleLoop
}) {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl bg-[#FAF9F6] border border-[#DCD7CD] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">

      {/* Left: Playback Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPlayPause}
          className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] hover:from-[#FFFDF9] hover:to-[#EFECE6] text-[#18181B] flex items-center justify-center font-bold shadow-glow-cyan/50 transition-transform active:scale-95"
          aria-label={isPlaying ? 'Pause Audio and Video' : 'Play Audio and Video'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={onReset}
          className="p-3 rounded-xl bg-[#EFECE6] hover:bg-[#EFECE6] text-[#71717A] hover:text-[#18181B] border border-[#DCD7CD]/80 transition-colors"
          title="Restart Playback from Beginning"
          aria-label="Restart Playback"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleLoop}
          className={`p-3 rounded-xl border transition-all ${
            isLooping
              ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/50'
              : 'bg-[#EFECE6] text-[#71717A] border-[#DCD7CD]/80 hover:text-[#18181B]'
          }`}
          title="Toggle Seamless Loop"
          aria-label="Toggle Loop"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Middle: Digital Time Display */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#EFECE6] border border-[#DCD7CD] font-mono">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-semibold">SYNCHRONIZED TELEMETRY TIME</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#D97706] tracking-wider">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-[#71717A]">/</span>
            <span className="text-xs text-[#71717A]">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Master Volume Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl bg-[#EFECE6] hover:bg-[#EFECE6] text-[#71717A] hover:text-[#18181B] border border-[#DCD7CD]/80 transition-colors"
          aria-label={isMuted ? 'Unmute Master' : 'Mute Master'}
        >
          {isMuted || masterVolume === 0 ? (
            <VolumeX className="w-5 h-5 text-[#FC3D21]" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#D97706]" />
          )}
        </button>

        <div className="flex flex-col gap-1 w-28 sm:w-36">
          <div className="flex justify-between items-center text-[10px] font-mono text-[#71717A]">
            <span>MASTER GAIN</span>
            <span className="text-[#18181B] font-bold">{isMuted ? '0%' : `${masterVolume}%`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : masterVolume}
            onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
            className="w-full accent-[#0B3D91] bg-[#EFECE6] h-1.5 rounded-lg cursor-pointer"
            aria-label="Master Volume Slider"
          />
        </div>
      </div>

    </div>
  );
}
