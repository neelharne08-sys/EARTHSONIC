import React from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  Layers,
  Radio
} from 'lucide-react';

export default function TrackMixer({
  station,
  tracksState,
  onToggleTrackMute,
  onTrackVolumeChange,
  isPlaying
}) {
  return (
    <div className="rounded-2xl bg-[#FAF9F6] border border-[#DCD7CD] p-5 shadow-xl">

      {/* Mixer Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCD7CD]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EFECE6]/95 text-[#D97706] border border-[#DCD7CD]/70">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18181B] tracking-wide flex items-center gap-2">
              <span>Station Audio Stems</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFECE6] text-[#D97706] border border-[#DCD7CD]">
                {station.tracks.length} Channels Active
              </span>
            </h3>
            <p className="text-xs text-[#71717A] font-mono">
              Dynamic multi-track mixer for {station.shortName}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#71717A] bg-[#EFECE6] px-3 py-1.5 rounded-lg border border-[#DCD7CD]">
          <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#D97706] animate-pulse' : 'text-[#71717A]'}`} />
          <span>{isPlaying ? 'STEM BUS RUNNING' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Channel Strips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {station.tracks.map((track) => {
          const state = tracksState[track.id] || { volume: track.defaultVolume, muted: false };
          const isMuted = state.muted;
          const vol = isMuted ? 0 : state.volume;

          return (
            <div
              key={track.id}
              className={`p-4 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-[#EFECE6]/95 border-[#DCD7CD]/60 opacity-60'
                  : 'bg-[#EFECE6]/95 border-[#DCD7CD]/80 hover:border-[#DCD7CD]'
              }`}
            >
              {/* Channel Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="text-xs font-bold text-[#18181B] truncate" title={track.name}>
                    {track.name}
                  </span>
                </div>

                {/* Mute Button */}
                <button
                  onClick={() => onToggleTrackMute(track.id)}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                    isMuted
                      ? 'bg-[#EFECE6]/95 text-[#FC3D21] border-[#DCD7CD]/80'
                      : 'bg-[#EFECE6] text-[#71717A] border-[#DCD7CD] hover:text-[#18181B] hover:border-[#DCD7CD]'
                  }`}
                  title={isMuted ? 'Unmute track' : 'Mute track'}
                  aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${track.name}`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Volume Slider & Level Metric */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[#71717A]">GAIN</span>
                  <span className={isMuted ? 'text-[#FC3D21]' : 'text-[#D97706]'}>
                    {isMuted ? 'MUTED' : `${vol}%`}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vol}
                  disabled={isMuted}
                  onChange={(e) => onTrackVolumeChange(track.id, Number(e.target.value))}
                  className="w-full accent-[#0B3D91] bg-[#EFECE6] h-1.5 rounded cursor-pointer disabled:cursor-not-allowed"
                />

                {/* Simulated Signal Level LED meter */}
                <div className="flex gap-1 h-1.5 pt-1">
                  {[...Array(8)].map((_, i) => {
                    const threshold = (i + 1) * 12.5;
                    const isActive = isPlaying && !isMuted && vol >= threshold;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm transition-colors duration-75 ${
                          isActive
                            ? i > 5 ? 'bg-[#EFECE6]' : i > 3 ? 'bg-[#EFECE6]' : 'bg-[#EFECE6]'
                            : 'bg-[#EFECE6]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
