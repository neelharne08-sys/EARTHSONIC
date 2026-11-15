import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  Layers,
  Activity,
  Sparkles,
  Eye,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  X,
  FileCode,
  Globe
} from 'lucide-react';
import {
  NASA_EIC_STATIONS,
  REGIONAL_CALLOUTS,
  MULTI_BAND_SPECTRUM_DATA,
  ACOUSTIC_LAYER_BREAKDOWN,
  TEMPORAL_WAVEFORM_POINTS
} from '../data/nasaMockData';
import { audioEngine } from '../services/audioEngine';

export default function SonificationDashboardHUD({
  station = NASA_EIC_STATIONS[0],
  onBackToStage2,
  onToggleAccessibility,
  isAccessibilityOpen
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(14.2);
  const [duration, setDuration] = useState(45.0);
  const [masterVolume, setMasterVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(REGIONAL_CALLOUTS[0]);
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonUploadStatus, setJsonUploadStatus] = useState(null);

  // Mixer stem channels state
  const [mixerChannels, setMixerChannels] = useState({
    dustStrings: { name: 'Track 1: Dust Strings', volume: 85, muted: false, solo: false, color: '#D97706' },
    smokeBass: { name: 'Track 2: Smoke Bass Synth', volume: 75, muted: false, solo: false, color: '#FC3D21' },
    lightningPerc: { name: 'Track 3: ISS Lightning Percussion', volume: 90, muted: false, solo: false, color: '#0B3D91' },
    nightLightsArp: { name: 'Track 4: Night Lights Arp', volume: 70, muted: false, solo: false, color: '#71717A' },
  });

  const globeHUDCanvasRef = useRef(null);

  // Playback timer loop
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            return 0;
          }
          return +(prev + 0.1).toFixed(1);
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      audioEngine.startPlayback();
    } else {
      audioEngine.stopPlayback();
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
  };

  const handleVolumeChange = (trackKey, val) => {
    setMixerChannels(prev => ({
      ...prev,
      [trackKey]: { ...prev[trackKey], volume: val }
    }));
    audioEngine.setTrackVolume(trackKey, val / 100);
  };

  const handleToggleMute = (trackKey) => {
    const isNowMuted = audioEngine.toggleTrackMute(trackKey);
    setMixerChannels(prev => ({
      ...prev,
      [trackKey]: { ...prev[trackKey], muted: isNowMuted }
    }));
  };

  const handleToggleSolo = (trackKey) => {
    const isNowSolo = audioEngine.toggleTrackSolo(trackKey);
    setMixerChannels(prev => ({
      ...prev,
      [trackKey]: { ...prev[trackKey], solo: isNowSolo }
    }));
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    audioEngine.playRegionNote(region.soundNote.split(' ')[0] || 'C4');
  };

  // Canvas Earth with Interactive Regional Pins
  useEffect(() => {
    const canvas = globeHUDCanvasRef.current;
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
      const radius = Math.min(cx, cy) * 0.74;

      // Outer Cyan Atmospheric Ring
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.25);
      glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      glowGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Earth Globe Base
      const baseGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.05,
        cx,
        cy,
        radius
      );
      baseGrad.addColorStop(0, '#0B3D91');
      baseGrad.addColorStop(0.6, '#0B3D91');
      baseGrad.addColorStop(1, '#0B3D91');

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Latitude & Longitude HUD Grid
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      // Parallels
      for (let lat = -60; lat <= 60; lat += 30) {
        const yOffset = (lat / 90) * radius;
        const w = Math.sqrt(Math.max(0, radius * radius - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOffset, w, w * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Meridians
      for (let lon = 0; lon < 360; lon += 45) {
        const angle = ((lon + rotation) * Math.PI) / 180;
        const xOffset = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.ellipse(cx + xOffset * 0.5, cy, Math.abs(xOffset), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Regional Pins
      REGIONAL_CALLOUTS.forEach((reg) => {
        // Project onto circle
        const angle = ((reg.coordinates.x * 3.6 + rotation) * Math.PI) / 180;
        const px = cx + Math.cos(angle) * (radius * 0.65);
        const py = cy + ((reg.coordinates.y - 50) / 50) * (radius * 0.7);

        const isRegSelected = selectedRegion?.id === reg.id;

        // Pin Glow Pulse
        ctx.fillStyle = reg.accent;
        ctx.beginPath();
        ctx.arc(px, py, isRegSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        if (isRegSelected) {
          ctx.strokeStyle = '#71717A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.restore();

      // Atmospheric Rim
      ctx.strokeStyle = '#0B3D91';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      rotation += 0.2;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [selectedRegion]);

  // Handle custom OpenCV JSON upload
  const handleJsonUpload = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonUploadStatus({ success: true, message: `Loaded ${parsed.station || 'Custom'} OpenCV dataset (${parsed.events?.length || parsed.dataPoints?.length || 'N/A'} frames)` });
      setTimeout(() => {
        setJsonModalOpen(false);
      }, 1200);
    } catch (e) {
      setJsonUploadStatus({ success: false, message: 'Invalid JSON format. Check schema.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EFECE6] text-[#18181B] flex flex-col justify-between p-3 sm:p-6 font-sans">

      {/* 1. TOP HEADER BAR */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF9F6]/95 border border-[#DCD7CD]/80 shadow-2xl backdrop-blur-xl mb-6">

        {/* Left: Branding & Station Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStage2}
            className="p-2 rounded-xl bg-[#EFECE6] border border-[#DCD7CD] text-[#71717A] hover:text-[#18181B] transition-colors text-xs font-mono flex items-center gap-1.5"
            title="Return to Orbit View"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Orbit View</span>
          </button>

          <div className="h-6 w-[1px] bg-[#EFECE6]" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold font-display tracking-wider text-[#18181B]">
                THE EARTH INFORMATION JUKEBOX
              </span>
              <span className="text-xs font-mono text-[#D97706] hidden md:inline">
                // NASA EIC SONIFICATION
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFECE6]/95 text-[#D97706] border border-[#DCD7CD]/80 font-bold">
                {station.badge}
              </span>
              <span className="text-xs font-mono text-[#71717A] hidden sm:inline">
                {station.title}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Live Clock & Anomaly Telemetry */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-xl bg-[#EFECE6] border border-[#DCD7CD] font-mono text-xs">
          <div className="flex items-center gap-2 text-[#D97706]">
            <Clock className="w-3.5 h-3.5" />
            <span>TIME-LOCK: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
          </div>
          <span className="text-[#71717A]">|</span>
          <div className="flex items-center gap-2 text-[#71717A]">
            <Activity className="w-3.5 h-3.5 text-[#D97706] animate-pulse" />
            <span>ANOMALY: LOW | OPTICAL FLUX NORMAL | 47.2°N LAT</span>
          </div>
        </div>

        {/* Right: Accessibility & Data Upload Hook */}
        <div className="flex items-center gap-2">
          {/* Data Upload Hook */}
          <button
            onClick={() => setJsonModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#EFECE6] hover:bg-[#EFECE6] border border-[#DCD7CD] hover:border-[#DCD7CD] text-[#71717A] text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Drop in custom OpenCV frame-extraction JSON telemetry"
          >
            <Upload className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden sm:inline">Data Hook (JSON)</span>
          </button>

          {/* Screen Reader Voiceover Toggle */}
          <button
            onClick={() => setScreenReaderActive(!screenReaderActive)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              screenReaderActive
                ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                : 'bg-[#EFECE6] text-[#71717A] border-[#DCD7CD] hover:text-[#18181B]'
            }`}
            title="Screen-Reader Voiceover Mode for Blind & Low-Vision Users"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voiceover: {screenReaderActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onToggleAccessibility}
            className="p-2 rounded-lg bg-[#EFECE6] text-[#71717A] border border-[#DCD7CD] hover:text-[#18181B]"
            title="Accessibility Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. MAIN WORKSPACE: LEFT 3 STACKED CHARTS + RIGHT GLOWING EARTH & CALLOUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start mb-6">

        {/* LEFT COLUMN: 3 Stacked Glassmorphic Telemetry & Audio Charts (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">

          {/* Card 1: Multi-Band Frequency & Aerosol Spectrum (Bar Chart) */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6]/95 border border-[#DCD7CD] shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCD7CD]">
              <span className="text-xs font-mono font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
                Multi-Band Frequency & Aerosol Spectrum
              </span>
              <span className="text-[10px] font-mono text-[#D97706]">DUAL-SERIES</span>
            </div>

            <p className="text-[11px] text-[#71717A] font-mono mb-3">
              Comparing Series 1: NASA Pixel Intensity vs. Series 2: Synthesized Audio Frequency
            </p>

            <div className="flex items-end gap-2 h-32 pt-2 px-1 border-b border-[#DCD7CD]">
              {MULTI_BAND_SPECTRUM_DATA.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex gap-0.5 items-end justify-center h-full">
                    {/* Series 1: NASA Pixel Intensity (Cyan) */}
                    <div
                      className="w-1.5 sm:w-2 bg-[#EFECE6] rounded-t transition-all group-hover:brightness-125"
                      style={{ height: `${isPlaying ? Math.min(100, item.pixelIntensity + Math.sin(currentTime + idx) * 15) : item.pixelIntensity}%` }}
                      title={`NASA Pixel Intensity: ${item.pixelIntensity}%`}
                    />
                    {/* Series 2: Synthesized Audio Frequency Hz (Amber) */}
                    <div
                      className="w-1.5 sm:w-2 bg-[#EFECE6] rounded-t transition-all group-hover:brightness-125"
                      style={{ height: `${isPlaying ? Math.min(100, item.audioFreqHz + Math.cos(currentTime + idx) * 15) : item.audioFreqHz}%` }}
                      title={`Synthesized Audio Freq: ${item.audioFreqHz}%`}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-[#71717A]">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
                Series 1: NASA Pixel Intensity
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
                Series 2: Synthesized Audio Freq
              </span>
            </div>
          </div>

          {/* Card 2: Atmospheric & Acoustic Layer Breakdown (Donut Chart) */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6]/95 border border-[#DCD7CD] shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCD7CD]">
              <span className="text-xs font-mono font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
                Atmospheric & Acoustic Layer Breakdown
              </span>
              <span className="text-[10px] font-mono text-[#D97706]">LAYER SHARE</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut representation */}
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Dust 45% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#D97706" strokeWidth="4.5" strokeDasharray="45 100" strokeDashoffset="0" />
                  {/* Smoke 28% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#FC3D21" strokeWidth="4.5" strokeDasharray="28 100" strokeDashoffset="-45" />
                  {/* Sea Salt 17% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#0B3D91" strokeWidth="4.5" strokeDasharray="17 100" strokeDashoffset="-73" />
                  {/* Lightning 10% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#0B3D91" strokeWidth="4.5" strokeDasharray="10 100" strokeDashoffset="-90" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-mono font-bold text-[#18181B]">4</span>
                  <span className="text-[8px] font-mono text-[#71717A] block">STEMS</span>
                </div>
              </div>

              {/* Legends with live readouts */}
              <div className="flex-1 space-y-1.5 text-xs font-mono">
                {ACOUSTIC_LAYER_BREAKDOWN.map((layer, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-[#71717A]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                      <span className="truncate">{layer.name}</span>
                    </span>
                    <span className="font-bold text-[#18181B]">{layer.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Temporal Sonification Waveform (Dual-Spline Line Chart) */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6]/95 border border-[#DCD7CD] shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCD7CD]">
              <span className="text-xs font-mono font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EFECE6]" />
                Temporal Sonification Waveform
              </span>
              <span className="text-[10px] font-mono text-[#D97706]">DUAL-SPLINE</span>
            </div>

            {/* SVG Dual-Spline Waveform */}
            <div className="h-28 w-full bg-[#EFECE6] rounded-xl border border-[#DCD7CD]/80 p-2 relative overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                {/* Horizontal reference grid */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

                {/* Spline 1: Visual Luminosity Index (Cyan) */}
                <path
                  d="M 0 30 Q 20 10, 40 25 T 70 15 T 100 28"
                  fill="none"
                  stroke="#0B3D91"
                  strokeWidth="1.8"
                />

                {/* Spline 2: Harmonic Pitch & Tempo (Amber) */}
                <path
                  d="M 0 20 Q 25 35, 50 18 T 80 32 T 100 16"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="1.8"
                  strokeDasharray="2 1"
                />
              </svg>

              {/* Real-time playhead line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#EFECE6] shadow-[0_0_8px_#fff]"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] mt-2">
              <span className="text-[#D97706]">Luminosity / Motion Index</span>
              <span className="text-[#18181B]">Harmonic Pitch & Tempo</span>
            </div>
          </div>

        </div>

        {/* RIGHT / CENTER AREA: Glowing Earth + Interactive Region Callouts (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Main Visualizer Globe HUD Container */}
          <div className="relative rounded-2xl bg-[#FAF9F6]/95 border border-[#DCD7CD] shadow-2xl overflow-hidden p-4 min-h-[360px] flex flex-col justify-between">

            {/* Top Telemetry Header inside Globe */}
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#DCD7CD]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EFECE6] animate-ping" />
                <span className="text-[#18181B] font-bold">PLANETARY GEOSPATIAL TELEMETRY</span>
              </div>
              <span className="text-[#D97706]">CLICK PINS TO AUDITION REGION</span>
            </div>

            {/* Canvas Earth */}
            <div className="relative flex-1 flex items-center justify-center my-2 min-h-[260px]">
              <canvas
                ref={globeHUDCanvasRef}
                className="w-full h-full max-h-[340px] max-w-[340px] aspect-square block cursor-pointer"
              />
            </div>

            {/* Region Callout Selection Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#DCD7CD]">
              {REGIONAL_CALLOUTS.map(reg => {
                const isSelected = selectedRegion?.id === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => handleSelectRegion(reg)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#EFECE6] border-[#DCD7CD] ring-1 ring-[#0B3D91] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                        : 'bg-[#EFECE6]/95 border-[#DCD7CD] hover:border-[#DCD7CD]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-[#D97706]" />
                      <span className="text-[11px] font-bold text-[#18181B] truncate block">
                        {reg.name.split('/')[0]}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#71717A] block truncate">
                      {reg.lat}, {reg.lon}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Floating Localized HUD Telemetry Callout Card */}
            {selectedRegion && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#EFECE6]/95 border border-[#DCD7CD]/80 shadow-2xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#18181B]">{selectedRegion.name}</span>
                    <span className="text-[10px] text-[#D97706] px-1.5 py-0.2 rounded bg-[#EFECE6]/95 border border-[#DCD7CD]/70">
                      {selectedRegion.soundNote}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-0.5">
                    {selectedRegion.phenomenon}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <div>
                    <span className="text-[#71717A] block text-[9px]">AOD DENSITY</span>
                    <span className="text-[#D97706] font-bold">{selectedRegion.telemetry.aodValue}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block text-[9px]">LIGHTNING FLUX</span>
                    <span className="text-[#D97706] font-bold">{selectedRegion.telemetry.lightningDensity}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block text-[9px]">URBAN RADIANCE</span>
                    <span className="text-[#D97706] font-bold">{selectedRegion.telemetry.urbanLuminance}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 3. BOTTOM CENTER/RIGHT CONTROLS: CIRCULAR GAUGES & MULTI-TRACK MIXER */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6]/95 border border-[#DCD7CD] shadow-xl space-y-4">

            {/* Top Bar of Controls: Play/Pause, Timeline, & Two Circular Progress Gauges */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#DCD7CD]">

              {/* Transport Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-[#EFECE6] text-[#18181B] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-transform active:scale-95 cursor-pointer"
                  aria-label={isPlaying ? 'Pause Sonification' : 'Play Sonification'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-[#EFECE6] text-[#71717A] hover:text-[#18181B] border border-[#DCD7CD]"
                  title="Reset to 00:00"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="text-xs font-mono">
                  <span className="text-[#D97706] font-bold">{currentTime.toFixed(1)}s</span>
                  <span className="text-[#71717A]"> / </span>
                  <span className="text-[#71717A]">{duration.toFixed(1)}s</span>
                </div>
              </div>

              {/* Two Circular Cyan Progress Gauges */}
              <div className="flex items-center gap-6">

                {/* Gauge 1: Sonification Sync % */}
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#0B3D91" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#0B3D91" strokeWidth="3" strokeDasharray="98.4 100" />
                    </svg>
                    <span className="absolute text-[9px] font-mono font-bold text-[#D97706]">98%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#71717A] block uppercase">Sonification Sync</span>
                    <span className="text-[11px] font-mono font-bold text-[#18181B]">98.4% Frame-Lock</span>
                  </div>
                </div>

                {/* Gauge 2: Spectral Harmonic Index */}
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#0B3D91" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#71717A" strokeWidth="3" strokeDasharray="78.5 100" />
                    </svg>
                    <span className="absolute text-[9px] font-mono font-bold text-[#D97706]">7.8</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#71717A] block uppercase">Harmonic Index</span>
                    <span className="text-[11px] font-mono font-bold text-[#18181B]">7.85 / 10.0</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Horizontal Multi-Track Jukebox Mixer Bars with Mute / Solo */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                <span>MULTI-TRACK JUKEBOX STEM MIXER</span>
                <span>WEB AUDIO PENTATONIC SYNTH</span>
              </div>

              {Object.keys(mixerChannels).map(key => {
                const track = mixerChannels[key];
                return (
                  <div
                    key={key}
                    className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-all ${
                      track.muted
                        ? 'bg-[#EFECE6]/95 border-[#DCD7CD] opacity-50'
                        : 'bg-[#EFECE6] border-[#DCD7CD]/80 hover:border-[#DCD7CD]'
                    }`}
                  >
                    {/* Track Name */}
                    <div className="flex items-center gap-2 w-48">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: track.color }} />
                      <span className="text-[#18181B] font-bold truncate">{track.name}</span>
                    </div>

                    {/* Mute & Solo Toggles */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleMute(key)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          track.muted
                            ? 'bg-[#EFECE6]/95 text-[#FC3D21] border-[#DCD7CD]/80'
                            : 'bg-[#FAF9F6] text-[#71717A] border-[#DCD7CD] hover:text-[#18181B]'
                        }`}
                      >
                        MUTE
                      </button>

                      <button
                        onClick={() => handleToggleSolo(key)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          track.solo
                            ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                            : 'bg-[#FAF9F6] text-[#71717A] border-[#DCD7CD] hover:text-[#18181B]'
                        }`}
                      >
                        SOLO
                      </button>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.muted ? 0 : track.volume}
                        disabled={track.muted}
                        onChange={(e) => handleVolumeChange(key, Number(e.target.value))}
                        className="w-full accent-[#0B3D91] bg-[#FAF9F6] h-1.5 rounded cursor-pointer"
                      />
                      <span className="w-8 text-right text-[10px] text-[#D97706]">
                        {track.muted ? '0%' : `${track.volume}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* JSON DATA HOOK MODAL (DROP IN OPENCV DATA) */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#EFECE6]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border border-[#DCD7CD] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD7CD]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-base font-bold text-[#18181B] font-display">OpenCV JSON Frame-Extraction Hook</h3>
              </div>
              <button onClick={() => setJsonModalOpen(false)} className="text-[#71717A] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#71717A] font-mono">
              Paste custom precomputed Python/OpenCV timeline JSON (e.g., station events, pixel intensities, or temporal coordinates).
            </p>

            <textarea
              rows={7}
              placeholder={`{\n  "station": "iss-lightning",\n  "duration": 30,\n  "events": [\n    { "time": 1.2, "intensity": 0.8 },\n    { "time": 3.5, "intensity": 0.5 }\n  ]\n}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#EFECE6] border border-[#DCD7CD] text-xs font-mono text-[#D97706] focus:outline-none focus:border-[#DCD7CD]"
            />

            {jsonUploadStatus && (
              <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                jsonUploadStatus.success ? 'bg-[#EFECE6]/95 text-[#D97706] border border-[#DCD7CD]/80' : 'bg-[#EFECE6]/95 text-[#FC3D21] border border-[#DCD7CD]/80'
              }`}>
                {jsonUploadStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{jsonUploadStatus.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setJsonModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#EFECE6] text-[#71717A] hover:text-[#18181B] text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleJsonUpload}
                className="px-5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#EFECE6] text-[#18181B] font-bold text-xs font-mono shadow-glow-cyan"
              >
                Inject Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
