import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  ArrowRight,
  Layers,
  Activity,
  Clock,
  Volume2,
  VolumeX,
  Compass,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { NASA_SVS_DATASETS } from '../data/nasaSvsData';
import { voicesEngine } from '../services/voicesEngine';

export default function GlobeSelectorStage({
  onLaunchHUD,
  selectedStation,
  onSelectStation,
  onBackToStage1
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState(18);
  const [speechActive, setSpeechActive] = useState(true);
  const canvasRef = useRef(null);

  const currentDataset = NASA_SVS_DATASETS[activeIndex] || NASA_SVS_DATASETS[0];

  // 18-second guided loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setActiveIndex(curr => (curr + 1) % NASA_SVS_DATASETS.length);
          return 18;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  // Sync parent state
  useEffect(() => {
    onSelectStation(currentDataset);
  }, [activeIndex, onSelectStation]);

  const handleSelectStation = (index) => {
    setActiveIndex(index);
    setCountdown(18);
    const dataset = NASA_SVS_DATASETS[index];
    onSelectStation(dataset);

    // Audition Voice
    if (dataset.id === 'svs-5011-iss-lightning') {
      voicesEngine.triggerOrbitalPercussion(0.9);
    } else if (dataset.id === 'svs-13786-caldwell-73') {
      voicesEngine.playGlockenspielNote(1046.5, 0.8);
    } else {
      voicesEngine.playMarimbaNote(329.63, 0.7);
    }

    if (speechActive) {
      voicesEngine.speakStationOverview(dataset);
    }
  };

  // 18-Second Rotating Globe Choreography with Waterfall Black Shading
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let rotation = 0;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.73;

      // Outer Cyan Atmospheric Rim Glow
      const atmGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.35);
      atmGlow.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      atmGlow.addColorStop(0.5, 'rgba(20, 184, 166, 0.15)');
      atmGlow.addColorStop(1, 'rgba(2, 4, 9, 0)');
      ctx.fillStyle = atmGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Earth Sphere Base (Waterfall Black material shading)
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, '#0B3D91');
      sphereGrad.addColorStop(0.5, '#0B3D91');
      sphereGrad.addColorStop(0.85, '#0B3D91');
      sphereGrad.addColorStop(1, '#0B3D91');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Geospatial Grid
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const yOffset = (lat / 90) * radius;
        const w = Math.sqrt(Math.max(0, radius * radius - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOffset, w, w * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let lon = 0; lon < 360; lon += 45) {
        const angle = ((lon + rotation) * Math.PI) / 180;
        const xOffset = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.ellipse(cx + xOffset * 0.5, cy, Math.abs(xOffset), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Feature contours matching active SVS station
      if (currentDataset.id.includes('lightning')) {
        for (let i = 0; i < 7; i++) {
          const lAngle = ((i * 51 + rotation * 2.2) * Math.PI) / 180;
          const lx = cx + Math.cos(lAngle) * (radius * 0.65);
          const ly = cy + Math.sin(lAngle) * (radius * 0.5);
          if (Math.random() > 0.35) {
            ctx.fillStyle = '#71717A';
            ctx.beginPath();
            ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (currentDataset.id.includes('night-lights')) {
        for (let i = 0; i < 45; i++) {
          const nAngle = ((i * 8 + rotation) * Math.PI) / 180;
          const nx = cx + Math.sin(nAngle) * (radius * 0.75);
          const ny = cy + Math.cos(nAngle * 0.7) * (radius * 0.55);
          ctx.fillStyle = 'rgba(192, 132, 252, 0.7)';
          ctx.beginPath();
          ctx.arc(nx, ny, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        for (let i = 0; i < 30; i++) {
          const aAngle = ((i * 12 + rotation * 1.2) * Math.PI) / 180;
          const ax = cx + Math.cos(aAngle) * (radius * 0.7);
          const ay = cy + Math.sin(aAngle) * (radius * 0.4);
          ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(245, 158, 11, 0.45)';
          ctx.beginPath();
          ctx.arc(ax, ay, 2.5 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Atmospheric Rim
      ctx.strokeStyle = '#0B3D91';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0B3D91';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      rotation += 0.32;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [currentDataset.id]);

  return (
    <div className="relative min-h-screen bg-[#EFECE6] overflow-hidden flex flex-col justify-between p-4 sm:p-8 select-none">

      {/* Giant Background Watermark Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
        <div className="text-center">
          <div className="text-xs sm:text-sm font-mono tracking-hud text-[#D97706]/40 uppercase mb-2">
            EXPLORE NASA EIC SONIFICATION
          </div>
          <div className="text-6xl sm:text-9xl md:text-[13rem] font-extrabold font-display tracking-hud uppercase text-[#18181B]/[0.04] leading-none whitespace-nowrap">
            EARTH JUKEBOX
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#DCD7CD]/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStage1}
            className="p-2 rounded-xl bg-[#EFECE6] border border-[#DCD7CD] text-[#71717A] hover:text-[#18181B] transition-colors text-xs font-mono flex items-center gap-1.5"
            title="Return to Solar System Intro"
          >
            <span>← Stage 01</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base sm:text-lg text-[#18181B] tracking-hud uppercase">
                EARTH JUKEBOX
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFECE6]/95 text-[#D97706] border border-[#DCD7CD]/80 font-bold">
                10 NASA SVS STATIONS
              </span>
            </div>
            <p className="text-xs font-mono text-[#71717A] hidden sm:block">
              18-Second Interactive Globe Choreography
            </p>
          </div>
        </div>

        {/* Guided Tour Countdown & Launch HUD */}
        <div className="flex items-center gap-3">
          {/* Spoken Voices Toggle */}
          <button
            onClick={() => {
              const next = !speechActive;
              setSpeechActive(next);
              voicesEngine.toggleSpeech(next);
            }}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              speechActive
                ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                : 'bg-[#EFECE6] text-[#71717A] border-[#DCD7CD]'
            }`}
            title="Toggle Spoken NASA Voiceover Guide"
          >
            {speechActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Voiceover: {speechActive ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#EFECE6] border border-[#DCD7CD] px-3 py-1.5 rounded-xl text-[#71717A]">
            <Clock className="w-3.5 h-3.5 text-[#D97706] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Tour: <strong className="text-[#D97706] tabular-nums font-bold">{countdown}s</strong></span>
          </div>

          <button
            onClick={() => onLaunchHUD(currentDataset)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] hover:from-[#FFFDF9] hover:to-[#EFECE6] text-[#D97706] font-display font-bold text-xs tracking-hud uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>LAUNCH SONIFICATION HUD</span>
            <ArrowRight className="w-4 h-4 text-[#D97706]" />
          </button>
        </div>
      </div>

      {/* Main Section: Center Globe (7 Cols) + Right-Side Vertical Node Menu (5 Cols) */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">

        {/* Left / Center Area: Centerpiece Globe (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[500px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full max-h-[520px] max-w-[520px] aspect-square block cursor-grab active:cursor-grabbing"
          />

          {/* Active Station Sub-Badge */}
          <div className="mt-4 px-4 py-2 rounded-2xl bg-[#EFECE6]/95 backdrop-blur-md border border-[#DCD7CD] text-center shadow-xl">
            <div className="flex items-center justify-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#EFECE6] animate-ping" />
              <span className="text-[#18181B] font-bold">{currentDataset.svsId}: {currentDataset.shortName}</span>
              <span className="text-[#71717A]">•</span>
              <span className="text-[#D97706]">{currentDataset.voiceName}</span>
            </div>
          </div>
        </div>

        {/* Right-Side: Vertical Timeline Selector for ALL 10 NASA SVS STATIONS (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">

          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D97706]" />
              <span>10 Official NASA SVS Stations</span>
            </span>
            <span className="text-xs font-mono text-[#D97706]">10 Sources Online</span>
          </div>

          {/* Scrollable Node Timeline List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {NASA_SVS_DATASETS.map((dataset, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={dataset.id}
                  onClick={() => handleSelectStation(idx)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-[#EFECE6] border-[#DCD7CD] ring-1 ring-[#0B3D91]/80 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'bg-[#EFECE6]/95 border-[#DCD7CD]/80 hover:border-[#DCD7CD] hover:bg-[#EFECE6]/95'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      isActive
                        ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]'
                        : 'bg-[#EFECE6] text-[#71717A] border-[#DCD7CD]'
                    }`}>
                      {dataset.svsId}
                    </span>

                    <div>
                      <span className={`text-xs font-bold font-sans block ${isActive ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
                        {dataset.shortName}
                      </span>
                      <span className="text-[10px] font-mono text-[#71717A] line-clamp-1">
                        {dataset.voiceName}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#D97706] translate-x-1' : 'text-[#71717A] group-hover:text-[#71717A]'}`} />
                </div>
              );
            })}
          </div>

          {/* Sleek Preview Card for Active SVS Source */}
          <div className="p-4 rounded-xl bg-[#EFECE6]/95 backdrop-blur-xl border border-[#DCD7CD]/80 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD7CD] pb-2">
              <span className="text-xs font-mono font-bold text-[#D97706]">
                {currentDataset.voiceName}
              </span>
              <span className="text-[11px] font-mono tabular-nums text-[#71717A]">
                {currentDataset.telemetry.instrument || currentDataset.telemetry.spectralHz}
              </span>
            </div>

            <p className="text-xs text-[#71717A] font-sans leading-relaxed">
              {currentDataset.voiceDescription}
            </p>

            <button
              onClick={() => onLaunchHUD(currentDataset)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFFDF9] via-[#FAF9F6] to-[#EFECE6] hover:from-[#FFFDF9] hover:to-[#EFECE6] text-[#D97706] font-display font-bold text-xs tracking-hud uppercase shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>LAUNCH SONIFICATION HUD</span>
              <ArrowRight className="w-4 h-4 text-[#D97706]" />
            </button>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 flex flex-wrap items-center justify-between text-xs font-mono text-[#71717A] border-t border-[#DCD7CD]/80 pt-3 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[#71717A]">STAGE 02: 18-SECOND GLOBE CHOREOGRAPHY</span>
          <span>•</span>
          <span className="text-[#D97706]">WATERFALL BLACK MATERIAL</span>
        </div>

        <div className="text-[#71717A]">
          sandhillstudio1_pindown.io_1794653066.mp4
        </div>
      </div>

    </div>
  );
}
