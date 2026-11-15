import React from 'react';
import { 
  Eye, 
  Volume2, 
  Sliders, 
  Type, 
  Zap, 
  X, 
  Keyboard, 
  Check, 
  Info 
} from 'lucide-react';

export default function AccessibilityControls({
  isOpen,
  onClose,
  highContrast,
  setHighContrast,
  reducedMotion,
  setReducedMotion,
  fontSize,
  setFontSize,
  audioDescriptions,
  setAudioDescriptions
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#FAF9F6]/95 backdrop-blur-xl border-l border-[#DCD7CD]/80 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200"
      role="dialog"
      aria-label="Accessibility Options"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#DCD7CD]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EFECE6]/95 text-[#D97706] border border-[#DCD7CD]/70">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#18181B] tracking-wide">Accessibility</h2>
            <p className="text-xs text-[#71717A] font-mono">Sensory & Interface Tuning</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#EFECE6] transition-colors"
          aria-label="Close accessibility panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {/* Contrast Toggle */}
        <div className="p-4 rounded-xl bg-[#EFECE6] border border-[#DCD7CD]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#18181B] block">High Contrast Mode</span>
              <span className="text-xs text-[#71717A]">Boosts border outlines & telemetry text contrast</span>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              role="switch"
              aria-checked={highContrast}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                highContrast ? 'bg-[#EFECE6]' : 'bg-[#EFECE6]'
              }`}
            >
              <div
                className={`bg-[#EFECE6] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="p-4 rounded-xl bg-[#EFECE6] border border-[#DCD7CD]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#18181B] block">Reduced Motion</span>
              <span className="text-xs text-[#71717A]">Silences visual pulses and rapid waveform sweeps</span>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              role="switch"
              aria-checked={reducedMotion}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                reducedMotion ? 'bg-[#EFECE6]' : 'bg-[#EFECE6]'
              }`}
            >
              <div
                className={`bg-[#EFECE6] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Text Scaling */}
        <div className="p-4 rounded-xl bg-[#EFECE6] border border-[#DCD7CD]">
          <label className="text-sm font-semibold text-[#18181B] block mb-2 flex items-center gap-2">
            <Type className="w-4 h-4 text-[#D97706]" />
            <span>Telemetry Font Scale</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '100%', label: 'Default', size: '1rem' },
              { id: '115%', label: 'Large', size: '1.15rem' },
              { id: '130%', label: 'X-Large', size: '1.3rem' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFontSize(opt.size)}
                className={`px-3 py-2 text-xs font-mono rounded-lg border text-center transition-all ${
                  fontSize === opt.size
                    ? 'bg-[#EFECE6]/95 border-[#DCD7CD] text-[#D97706] font-bold'
                    : 'bg-[#FAF9F6] border-[#DCD7CD] text-[#71717A] hover:border-[#DCD7CD]'
                }`}
              >
                {opt.label} ({opt.id})
              </button>
            ))}
          </div>
        </div>

        {/* Audio Spoken Description Cue */}
        <div className="p-4 rounded-xl bg-[#EFECE6] border border-[#DCD7CD]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#18181B] block flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#D97706]" />
                <span>Audio Cues & Sonification Assist</span>
              </span>
              <span className="text-xs text-[#71717A]">Auditory clicks upon telemetry state changes</span>
            </div>
            <button
              onClick={() => setAudioDescriptions(!audioDescriptions)}
              role="switch"
              aria-checked={audioDescriptions}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                audioDescriptions ? 'bg-[#EFECE6]' : 'bg-[#EFECE6]'
              }`}
            >
              <div
                className={`bg-[#EFECE6] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  audioDescriptions ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="p-4 rounded-xl bg-[#EFECE6]/95 border border-[#DCD7CD]">
          <h3 className="text-xs font-mono font-bold text-[#71717A] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#71717A]" />
            <span>Keyboard Shortcuts</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-[#71717A]">
            <li className="flex justify-between items-center">
              <span>Play / Pause</span>
              <kbd className="px-2 py-0.5 rounded bg-[#EFECE6] border border-[#DCD7CD] text-[#D97706]">Space</kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Select Station 1, 2, 3</span>
              <kbd className="px-2 py-0.5 rounded bg-[#EFECE6] border border-[#DCD7CD] text-[#D97706]">1 / 2 / 3</kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Mute / Unmute Master</span>
              <kbd className="px-2 py-0.5 rounded bg-[#EFECE6] border border-[#DCD7CD] text-[#D97706]">M</kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Toggle Accessibility</span>
              <kbd className="px-2 py-0.5 rounded bg-[#EFECE6] border border-[#DCD7CD] text-[#D97706]">A</kbd>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
