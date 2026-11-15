import { loadNasaImageSonification } from '../services/nasaImageSonification.mjs';
import React, { useState, useEffect } from 'react';
import EarthImageViewer from '../components/EarthImageViewer';
import EarthsonicEnhancements from '../components/EarthsonicEnhancements';
import AudioControls from '../components/AudioControls';
import TrackMixer from '../components/TrackMixer';
import AudioVisualizer from '../components/AudioVisualizer';
import ImageBrightnessTimeline from '../components/ImageBrightnessTimeline';
import MixStudio from '../components/MixStudio';
import ScientificJukebox from '../components/ScientificJukebox';
import { STATIONS } from '../data/stations';
import { dataService } from '../services/dataService';
import { audioEngine } from '../services/audioEngine';
import {
  Radio,
  Info,
  Sliders,
  Layers,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  Activity,
  Globe2,
  Cpu,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Jukebox({
  selectedStation,
  onSelectStation,
  onBackToHome,
  user = null,
  csrfToken = '',
  pendingMix = null,
  onLoadMix
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(45.0);
  const [masterVolume, setMasterVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [overlayActive, setOverlayActive] = useState(true);
  const [timelineData, setTimelineData] = useState(null);
  const [speechActive, setSpeechActive] = useState(true);
  const [scienceStopSignal, setScienceStopSignal] = useState(0);

  // EarthPulse FastAPI backend integration state
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'standby' | 'checking'
  const [earthPulseData, setEarthPulseData] = useState(null);
  const [isSyncingBackend, setIsSyncingBackend] = useState(false);

  // Initialize track states dynamically from the active station's tracks
  const [tracksState, setTracksState] = useState(() => {
    const initial = {};
    selectedStation.tracks.forEach(tr => {
      initial[tr.id] = { volume: tr.defaultVolume, muted: false };
    });
    return initial;
  });


  useEffect(() => {
    let active = true;
    setEarthPulseData(null);
    loadNasaImageSonification(selectedStation.id)
      .then(data => {
        if (active) setEarthPulseData(data);
      })
      .catch(error => {
        if (active) console.warn('NASA image feature analysis unavailable:', error.message);
      });
    return () => { active = false; };
  }, [selectedStation.id]);

  // Check EarthPulse FastAPI backend connection on mount & load sonification data
  useEffect(() => {
    let mounted = true;

    async function initBackend() {
      const health = await dataService.checkBackendHealth(backendUrl);
      if (!mounted) return;

      if (health.online) {
        setBackendStatus('online');
      } else {
        setBackendStatus('standby');
      }


    }

    initBackend();

    return () => {
      mounted = false;
    };
  }, [backendUrl]);

  // When station changes, update tracks and load timeline
  useEffect(() => {
    let mounted = true;
    dataService.loadTimeline(selectedStation.id).then(data => {
      if (mounted) {
        setTimelineData(data);
        if (data.duration) setDuration(data.duration);
      }
    });

    const newTrackState = {};
    selectedStation.tracks.forEach(tr => {
      newTrackState[tr.id] = { volume: tr.defaultVolume, muted: false };
    });
    setTracksState(newTrackState);
    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      mounted = false;
    };
  }, [selectedStation.id]);

  useEffect(() => {
    const mix = pendingMix?.mix;
    if (!mix || mix.station_id !== selectedStation.id) return;

    const settings = mix.settings;
    setMasterVolume(settings.master_volume);
    setIsMuted(settings.is_muted);
    setIsLooping(settings.is_looping);
    setOverlayActive(settings.overlay_active);
    setSpeechActive(settings.speech_active);
    setIsPlaying(false);
    setCurrentTime(0);
    audioEngine.stopEarthPulse();
    setScienceStopSignal((value) => value + 1);
    audioEngine.toggleSpeech(settings.speech_active);
    audioEngine.setMasterVolume(
      settings.is_muted ? 0 : settings.master_volume / 100
    );

    const restoredTracks = {};

    selectedStation.tracks.forEach((track) => {
      const saved = settings.tracks?.[track.id];
      const volume = saved?.volume ?? track.defaultVolume;
      const muted = saved?.muted ?? false;
      restoredTracks[track.id] = { volume, muted };
      audioEngine.setTrackVolume(track.id, muted ? 0 : volume / 100);
    });

    setTracksState(restoredTracks);
  }, [pendingMix, selectedStation.id]);

  useEffect(() => {
    setScienceStopSignal((value) => value + 1);
  }, [selectedStation.id]);

  // Real-time audio frequency stream modulation during playback
  useEffect(() => {
    if (isPlaying && earthPulseData?.frequencies?.length) {
      const sampleIndex = Math.floor((currentTime / duration) * (earthPulseData.sample_count || 100)) % 100;
      const freq = earthPulseData.frequencies[sampleIndex] || 440;
      const brightness = earthPulseData.brightness[sampleIndex] || 0.5;
      audioEngine.playEarthPulseFrame(freq, brightness);
    } else {
      audioEngine.stopEarthPulse();
    }
  }, [isPlaying, currentTime, duration, earthPulseData]);

  useEffect(() => {
    audioEngine.setMasterVolume(isMuted ? 0 : masterVolume / 100);
  }, [masterVolume, isMuted]);

  const handlePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      setScienceStopSignal((value) => value + 1);
      audioEngine.init();
      audioEngine.resume();
      if (speechActive) {
        audioEngine.speakStationInfo(selectedStation);
      }
    } else {
      audioEngine.stopEarthPulse();
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
    audioEngine.stopEarthPulse();
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
  };

  const handleToggleTrackMute = (trackId) => {
    setTracksState(prev => {
      const current = prev[trackId] || { volume: 75, muted: false };
      const nextMuted = !current.muted;
      audioEngine.setTrackVolume(trackId, nextMuted ? 0 : current.volume / 100);
      return {
        ...prev,
        [trackId]: { ...current, muted: nextMuted }
      };
    });
  };

  const handleTrackVolumeChange = (trackId, newVol) => {
    setTracksState(prev => {
      const current = prev[trackId] || { volume: 75, muted: false };
      audioEngine.setTrackVolume(trackId, current.muted ? 0 : newVol / 100);
      return {
        ...prev,
        [trackId]: { ...current, volume: newVol }
      };
    });
  };

  // Re-fetch live data from FastAPI backend endpoint /api/sonification
  const handleSyncBackend = async () => {
    setIsSyncingBackend(true);
    const health = await dataService.checkBackendHealth(backendUrl);
    setBackendStatus(health.online ? 'online' : 'standby');

    try {
      const sonification = await loadNasaImageSonification(selectedStation.id);
      setEarthPulseData(sonification);
    } catch (error) {
      console.warn('NASA image analysis failed:', error.message);
      setEarthPulseData(null);
    }
    setIsSyncingBackend(false);

    if (speechActive) {
      audioEngine.speakText(
        health.online
          ? `Connected to the Earthsonic backend. This station uses NASA still-image feature sonification with 100 display-luminance samples.`
          : `Backend is in standby. Image-feature sonification can run locally from downloaded NASA still images.`
      );
    }
  };

  // Compute live sample indices for display
  const currentSampleIdx = Math.floor((currentTime / duration) * (earthPulseData?.sample_count || 100)) % 100;
  const currentHz = earthPulseData?.frequencies?.[currentSampleIdx] || 440;
  const currentB = earthPulseData?.brightness?.[currentSampleIdx] || 0.5;

  return (
    <div className="editorial-jukebox min-h-screen py-8 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Breadcrumb & Station Switcher Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#EFECE6] border border-[#DCD7CD] shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#71717A] hover:text-[#18181B] border border-[#DCD7CD] transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Overview</span>
            </button>

            <div className="h-6 w-[1px] bg-[#EFECE6] hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#D97706] uppercase">
                  {selectedStation.svsId}:
                </span>
                <span className="text-sm font-bold text-[#18181B] font-display">
                  {selectedStation.title}
                </span>
                <a
                  href={selectedStation.svsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-[#FAF9F6] text-[#71717A] hover:text-[#D97706] border border-[#DCD7CD] transition-colors"
                  title="View Official SVS Page"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] font-sans text-[#D97706] font-medium">
                {selectedStation.voiceName} • {selectedStation.displayMode}
              </p>
            </div>
          </div>

          {/* Quick Voiceover Guide Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !speechActive;
                setSpeechActive(next);
                audioEngine.toggleSpeech(next);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
                speechActive
                  ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                  : 'bg-[#FAF9F6] text-[#71717A] border-[#DCD7CD]'
              }`}
              title="NASA Spoken Voiceover Guide for Telemetry & Alerts"
            >
              {speechActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>NASA Voiceover: {speechActive ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* 10 SVS Stations Scrollable Pill Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {STATIONS.map(stn => {
            const isActive = stn.id === selectedStation.id;
            return (
              <button
                key={stn.id}
                onClick={() => onSelectStation(stn)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#EFECE6] text-[#18181B] font-bold border-[#DCD7CD] shadow-glow-cyan'
                    : 'bg-[#EFECE6] text-[#71717A] hover:text-[#18181B] hover:bg-[#EFECE6] border-[#DCD7CD]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#EFECE6]' : 'bg-[#EFECE6]'}`} />
                <span>{stn.svsId}: {stn.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Live EarthPulse FastAPI Backend Connection Banner */}
        <div className="p-4 rounded-2xl bg-[#EFECE6]/95 border border-[#DCD7CD] flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
              backendStatus === 'online'
                ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                : 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#18181B] uppercase tracking-wider">
                  EarthPulse Backend:
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  backendStatus === 'online'
                    ? 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                    : 'bg-[#EFECE6]/95 text-[#D97706] border-[#DCD7CD]/80'
                }`}>
                  {backendStatus === 'online' ? 'FastAPI ONLINE' : 'Backend standby • local image scanning works'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#71717A] mt-0.5">
                Browser Canvas image scan • 100 normalized display-brightness samples (180–760 Hz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Readout Values */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#DCD7CD]">
              <span className="text-[#71717A]">
                PT #{currentSampleIdx + 1}: <strong className="text-[#D97706] font-bold">{currentHz} Hz</strong>
              </span>
              <span className="text-[#71717A]">|</span>
              <span className="text-[#71717A]">
                BRIGHTNESS: <strong className="text-[#D97706] font-bold">{currentB}</strong>
              </span>
            </div>

            <button
              onClick={handleSyncBackend}
              disabled={isSyncingBackend}
              className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#18181B] border border-[#DCD7CD] hover:border-[#DCD7CD] text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
              title="Check backend health and reload current NASA image analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D97706] ${isSyncingBackend ? 'animate-spin' : ''}`} />
              <span>{isSyncingBackend ? 'Polling...' : 'Sync Backend'}</span>
            </button>
          </div>
        </div>

        <MixStudio
          mode="jukebox"
          user={user}
          csrfToken={csrfToken}
          stations={STATIONS}
          station={selectedStation}
          settings={{
            master_volume: masterVolume,
            is_muted: isMuted,
            is_looping: isLooping,
            overlay_active: overlayActive,
            speech_active: speechActive,
            tracks: tracksState
          }}
          onLoadMix={onLoadMix}
        />

        <EarthsonicEnhancements
          station={selectedStation}
          analysis={earthPulseData}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
        />

        <ScientificJukebox
          stopSignal={scienceStopSignal}
          onSciencePlay={() => {
            setIsPlaying(false);
            audioEngine.stopEarthPulse();
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          }}
        />

        {/* Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: NASA Video Player + Synchronized Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            <EarthImageViewer
              isLooping={isLooping}
              station={selectedStation}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              overlayActive={overlayActive}
              onToggleOverlay={() => setOverlayActive(!overlayActive)}
              onVideoDuration={(seconds) => setDuration(seconds)}
              onVideoError={() => {
                setIsPlaying(false);
                audioEngine.stopEarthPulse();
                if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
              }}
            />

            <ImageBrightnessTimeline
              brightness={earthPulseData?.brightness || []}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />

            <AudioControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              currentTime={currentTime}
              duration={duration}
              masterVolume={masterVolume}
              onMasterVolumeChange={setMasterVolume}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              isLooping={isLooping}
              onToggleLoop={() => setIsLooping(!isLooping)}
            />

          </div>

          {/* Right Column: Audio Stem Mixer + Real-time Visualizer + Voice Mapping Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            <AudioVisualizer
              isPlaying={isPlaying}
              color={selectedStation.accentColor}
              height={70}
              barsCount={32}
            />

            <TrackMixer
              station={selectedStation}
              tracksState={tracksState}
              onToggleTrackMute={handleToggleTrackMute}
              onTrackVolumeChange={handleTrackVolumeChange}
              isPlaying={isPlaying}
            />

            {/* Voice Mapping & NASA SVS Telemetry Info Card */}
            <div className="p-5 rounded-2xl bg-[#EFECE6] border border-[#DCD7CD] space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCD7CD]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D97706]" />
                  <h4 className="text-xs font-mono font-bold text-[#18181B] uppercase tracking-wider">
                    {selectedStation.voiceName}
                  </h4>
                </div>
                <a
                  href={selectedStation.svsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-[#D97706] flex items-center gap-1 hover:underline"
                >
                  <span>{selectedStation.svsId} Official Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-[#18181B] font-sans leading-relaxed">
                {selectedStation.sonificationApproach}
              </p>

              <div className="space-y-1.5 pt-1">
                {selectedStation.soundMapping.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#FAF9F6] border border-[#DCD7CD]/80">
                    <span className="text-[#18181B] font-sans font-medium truncate max-w-[50%]">
                      {item.data}
                    </span>
                    <span className="text-[#D97706] font-mono text-[11px] font-bold truncate max-w-[48%] text-right">
                      {item.sound}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] font-mono text-[#71717A] pt-1 flex justify-between">
                <span>Sensor: {selectedStation.telemetry.instrument || selectedStation.telemetry.platform}</span>
                <span className="text-[#D97706]">Image-derived sound · not physical measurements</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
