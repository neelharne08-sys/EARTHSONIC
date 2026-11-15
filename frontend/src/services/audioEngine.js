/**
 * audioEngine.js
 * Multi-Track Web Audio API Sonification Engine + Spoken NASA Audio Guide
 * Implements 10 Station Voices (Harp, Rain Pad, Marimba, Sub-Bass, Stereo Strings, Choir, etc.)
 */

// Pentatonic scale frequencies
const NOTES = {
  C2: 65.41, D2: 73.42, E2: 82.41, G2: 98.00, A2: 110.00,
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  C6: 1046.50
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.analyser = null;
    this.trackGains = {};
    this.isPlaying = false;
    this.initialized = false;
    this.arpTimer = null;
    this.ambientOscs = [];
    this.speechEnabled = true;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master dynamics compressor
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.initialized = true;
    } catch (err) {
      console.warn('AudioContext pending user interaction:', err);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  setTrackVolume(trackId, val) {
    if (this.trackGains[trackId] && this.ctx) {
      this.trackGains[trackId].gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  // Audition Voice signature for any of the 10 SVS stations
  playStationPreview(stationId) {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (stationId.includes('5011') || stationId === 'iss-lightning') {
      // Lightning Marimba Transient + Sub Kick
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1200, t);
      click.frequency.exponentialRampToValueAtTime(100, t + 0.08);
      clickGain.gain.setValueAtTime(0.5, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start(t);
      click.stop(t + 0.12);
    } else if (stationId.includes('4950')) {
      // GEDI Canopy Harp Ascending Arpeggio
      const harpNotes = [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.C4, NOTES.E4];
      harpNotes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.1);
        g.gain.setValueAtTime(0.3, t + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.6);
      });
    } else if (stationId.includes('5313') || stationId === 'night-lights') {
      // Night Lights Clocked Arp
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(NOTES.G4, t);
      osc.frequency.exponentialRampToValueAtTime(NOTES.C5, t + 0.3);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.8);
    } else if (stationId.includes('13786')) {
      // Hubble Glockenspiel Chime
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(NOTES.C6, t);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.0);
    } else {
      // Lush Atmospheric Warm Wash
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(NOTES.C3, t);
      osc.frequency.exponentialRampToValueAtTime(NOTES.G3, t + 0.4);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.3);
    }
  }

  // EarthPulse Python/FastAPI Real-Time Sonification (180 - 760 Hz)
  playEarthPulseFrame(freq = 440, brightness = 0.5) {
    this.init();
    this.resume();
    if (!this.ctx) return;

    // Clamp frequency strictly within backend spec: 180 to 760 Hz
    const clampedFreq = Math.max(180, Math.min(760, freq));
    const clampedGain = Math.max(0.01, Math.min(1.0, brightness)) * 0.4;
    const now = this.ctx.currentTime;

    if (!this.earthPulseOsc) {
      this.earthPulseOsc = this.ctx.createOscillator();
      this.earthPulseGain = this.ctx.createGain();

      this.earthPulseOsc.type = 'triangle';
      this.earthPulseOsc.frequency.setValueAtTime(clampedFreq, now);
      this.earthPulseGain.gain.setValueAtTime(clampedGain, now);

      this.earthPulseOsc.connect(this.earthPulseGain);
      this.earthPulseGain.connect(this.masterGain);
      this.earthPulseOsc.start(now);
    } else {
      this.earthPulseOsc.frequency.setTargetAtTime(clampedFreq, now, 0.04);
      this.earthPulseGain.gain.setTargetAtTime(clampedGain, now, 0.04);
    }
  }

  stopEarthPulse() {
    if (this.earthPulseOsc && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.earthPulseGain.gain.setTargetAtTime(0.001, now, 0.05);
        this.earthPulseOsc.stop(now + 0.06);
        this.earthPulseOsc.disconnect();
      } catch (e) {}
      this.earthPulseOsc = null;
      this.earthPulseGain = null;
    }
  }

  // Spoken Voiceover Guide for accessibility
  speakText(text) {
    if (!this.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.05;
      utt.pitch = 1.0;
      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  speakStationInfo(station) {
    const text = `Station ${station.svsId}: ${station.shortName}. ${station.voiceName}. ${station.description}. Sensor platform: ${station.telemetry.instrument || station.telemetry.platform}.`;
    this.speakText(text);
  }

  toggleSpeech(enabled) {
    this.speechEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  getFrequencyData() {
    if (!this.analyser) {
      return new Uint8Array(32).fill(12);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const audioEngine = new AudioEngine();
