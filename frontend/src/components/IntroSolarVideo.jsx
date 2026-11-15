import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Sparkles, 
  Compass, 
  Radio, 
  Globe 
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export default function IntroSolarVideo({ onCompleteStage1 }) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const canvasRef = useRef(null);

  // 10-second countdown timer with auto-transition
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onCompleteStage1();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCompleteStage1]);

  // Canvas Solar System Orbital Simulation Fallback
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Starfield particles
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.03 + 0.01
    }));

    // Orbit radii & speeds
    const orbits = [
      { name: 'Mercury', r: 70, speed: 2.4, color: '#0B3D91', size: 3 },
      { name: 'Venus', r: 110, speed: 1.8, color: '#D97706', size: 5 },
      { name: 'Earth', r: 160, speed: 1.2, color: '#0B3D91', size: 6.5, glow: true },
      { name: 'Mars', r: 210, speed: 0.95, color: '#FC3D21', size: 4 },
      { name: 'Jupiter', r: 280, speed: 0.6, color: '#D97706', size: 11 },
      { name: 'Saturn', r: 360, speed: 0.45, color: '#D97706', size: 9, hasRing: true },
      { name: 'Uranus', r: 430, speed: 0.3, color: '#0B3D91', size: 6 },
      { name: 'Neptune', r: 490, speed: 0.22, color: '#0B3D91', size: 6 }
    ];

    const render = () => {
      ctx.fillStyle = '#0B3D91';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw Twinkling Stars
      stars.forEach(s => {
        s.alpha += Math.sin(time * s.twinkleSpeed) * 0.01;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Camera dynamic zoom factor: zooms toward Earth over 10 seconds
      const zoomFactor = 1 + (10 - timeLeft) * 0.12;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoomFactor, zoomFactor);

      // Central Glowing Sun
      const sunGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 65);
      sunGrad.addColorStop(0, '#71717A');
      sunGrad.addColorStop(0.2, '#D97706');
      sunGrad.addColorStop(0.5, '#D97706');
      sunGrad.addColorStop(0.8, '#D97706');
      sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.fill();

      // Orbital Rings & Planets
      orbits.forEach(planet => {
        // Draw thin luminous ring
        ctx.strokeStyle = planet.glow ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = planet.glow ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.r, planet.r * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Calculate planet position along inclined orbit
        const angle = time * planet.speed * 0.4 + planet.r;
        const px = Math.cos(angle) * planet.r;
        const py = Math.sin(angle) * planet.r * 0.65;

        // Draw planet
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(px, py, planet.size, 0, Math.PI * 2);
        ctx.fill();

        // Earth special cyan atmospheric rim-glow
        if (planet.glow) {
          ctx.strokeStyle = '#0B3D91';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, planet.size + 3, 0, Math.PI * 2);
          ctx.stroke();

          // Target callout label
          ctx.fillStyle = '#0B3D91';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText('TARGET: EARTH', px + 12, py - 6);
        }

        // Saturn ring
        if (planet.hasRing) {
          ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(px, py, planet.size * 2, planet.size * 0.7, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.restore();

      time += 0.02;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [timeLeft]);

  // Web Audio ambient space drone warm-up
  const handleUserInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      audioEngine.startSpaceDrone();
    }
  };

  const handleSkip = () => {
    audioEngine.startSpaceDrone();
    onCompleteStage1();
  };

  return (
    <div 
      onClick={handleUserInteract}
      className="fixed inset-0 z-50 bg-[#EFECE6] overflow-hidden flex flex-col justify-between p-6 sm:p-10 select-none cursor-pointer"
    >
      {/* Background Solar System Video with Canvas Fallback */}
      <video
        autoPlay
        muted
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none hidden"
        src="/opening_solar_system.mp4"
      />

      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none" 
      />

      {/* Vignette & Ambient Radial Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#FAF9F6]/40 to-[#EFECE6]/90 pointer-events-none" />

      {/* Top Header Bar (HUD Style) */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FAF9F6]/95 border border-[#DCD7CD]/80 text-[#D97706] shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse text-[#D97706]" />
            <span className="font-display font-extrabold text-sm sm:text-base tracking-widest text-[#18181B]">
              NASA EIC // STAGE 01
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#71717A] bg-[#EFECE6]/95 px-3 py-1.5 rounded-lg border border-[#DCD7CD]">
            <span className="w-2 h-2 rounded-full bg-[#EFECE6] animate-ping" />
            <span>SOLAR SYSTEM TRAJECTORY LOCK</span>
          </div>
        </div>

        {/* Top-Right Skip Intro Button with Countdown */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
              APPROACH COUNTDOWN
            </span>
            <span className="text-sm font-mono font-bold text-[#D97706]">
              T-{timeLeft.toString().padStart(2, '0')}s
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="px-4 py-2.5 rounded-xl bg-[#FAF9F6]/95 hover:bg-[#EFECE6] border border-[#DCD7CD]/80 hover:border-[#DCD7CD] text-[#18181B] hover:text-[#18181B] font-mono text-xs tracking-wider transition-all shadow-lg flex items-center gap-2 group cursor-pointer"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D97706] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Title & Prompt */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-5 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFECE6]/95 border border-[#DCD7CD]/80 text-[#D97706] text-xs font-mono tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>2026 NASA SPACE APPS CHALLENGE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-[#18181B] drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
          THE EARTH INFORMATION{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFFDF9] via-[#FAF9F6] to-[#EFECE6]">
            JUKEBOX
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#71717A] font-mono max-w-xl mx-auto leading-relaxed">
          Approaching the third planet from the Sun. Translating multi-spectral planetary observation data into real-time multi-track audio sonification.
        </p>

        {/* Enter CTA / Audio Unlock Button */}
        <div className="pt-4">
          <button
            onClick={handleSkip}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#FAF9F6] to-[#EFECE6] hover:from-[#FFFDF9] hover:to-[#EFECE6] text-[#18181B] font-display font-extrabold text-sm sm:text-base tracking-wider shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto cursor-pointer"
          >
            <Globe className="w-5 h-5 text-[#18181B]" />
            <span>Enter the Earth Jukebox</span>
            <ArrowRight className="w-4 h-4 text-[#18181B]" />
          </button>

          <span className="text-[11px] font-mono text-[#71717A] block mt-2.5">
            Auto-advancing in {timeLeft} seconds • Click anywhere to enable Web Audio
          </span>
        </div>
      </div>

      {/* Bottom Telemetry HUD Line */}
      <div className="relative z-10 flex flex-wrap items-center justify-between text-xs font-mono text-[#71717A] border-t border-[#DCD7CD]/80 pt-4 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[#71717A]">MISSION: EIC-2026</span>
          <span>•</span>
          <span className="text-[#D97706]">AUDIO ENGINE READY</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#71717A]">OBSIDIAN DEEP-SPACE FIELD</span>
          <span className="text-[#D97706]">[030712]</span>
        </div>
      </div>
    </div>
  );
}
