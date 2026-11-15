/**
 * voicesEngine.js
 * Web Audio API Multi-Voice Synthesizer & Spoken Accessibility Guide
 * Implements NASA Caldwell 73 (SVS #13786) Instruments + SpeechSynthesis Voiceover
 */

// Pentatonic scale frequencies for real-time sonification
const SCALE = {
  C2: 65.41, D2: 73.42, E2: 82.41, G2: 98.00, A2: 110.00,
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  C6: 1046.50
};

class VoicesAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.analyser = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.speechEnabled = true;

    // Active nodes
    this.choirGain = null;
    this.marimbaGain = null;
    this.glockenspielGain = null;
    this.percussionGain = null;
    this.choirOscs = [];
    this.arpTimer = null;
    this.subBassOsc = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master dynamics compressor (prevents clipping)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Dedicated 4 NASA Caldwell 73 Instrument Channel Gains
      this.choirGain = this.createChannelGain(0.75);
      this.marimbaGain = this.createChannelGain(0.85);
      this.glockenspielGain = this.createChannelGain(0.70);
      this.percussionGain = this.createChannelGain(0.90);

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext pending user interaction:', e);
    }
  }

  createChannelGain(defaultGain = 0.8) {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(defaultGain, this.ctx.currentTime);
    gain.connect(this.masterGain);
    return gain;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* ---------------- 1. NASA Caldwell 73 (SVS #13786) Instruments ---------------- */

  // Instrument 1: Vocal Choir Pad (Warm mid-frequency sustained vowels)
  playChoirPad() {
    this.init();
    this.resume();
    if (!this.ctx || !this.choirGain) return;
    this.stopChoirPad();

    const notes = [SCALE.C3, SCALE.G3, SCALE.C4, SCALE.E4];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((i - 1.5) * 5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.choirGain);

      osc.start(now);
      this.choirOscs.push({ osc, gain });
    });
  }

  stopChoirPad() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.choirOscs.forEach(node => {
      try {
        node.gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        node.osc.stop(now + 0.5);
      } catch (e) {}
    });
    this.choirOscs = [];
  }

  // Instrument 2: Marimba (Warm wooden mallet strike for red/orange pixels)
  playMarimbaNote(freq = SCALE.E4, velocity = 0.8) {
    this.init();
    this.resume();
    if (!this.ctx || !this.marimbaGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Warm wooden mallet envelope
    gain.gain.setValueAtTime(0.4 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.marimbaGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Instrument 3: Glockenspiel (Crystalline high bell for blue pixels)
  playGlockenspielNote(freq = SCALE.C5, velocity = 0.7) {
    this.init();
    this.resume();
    if (!this.ctx || !this.glockenspielGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Metallic chime envelope
    gain.gain.setValueAtTime(0.3 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.glockenspielGain);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  // Instrument 4: Orbital Percussion (Transient snare crackle & punchy kick)
  triggerOrbitalPercussion(intensity = 0.9) {
    this.init();
    this.resume();
    if (!this.ctx || !this.percussionGain) return;

    const now = this.ctx.currentTime;

    // Transient click attack
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400 * intensity, now);
    clickOsc.frequency.exponentialRampToValueAtTime(90, now + 0.07);

    clickGain.gain.setValueAtTime(0.45 * intensity, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    clickOsc.connect(clickGain);
    clickGain.connect(this.percussionGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.09);

    // Sub kick punch
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(155 * intensity, now);
    kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

    kickGain.gain.setValueAtTime(0.55 * intensity, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    kickOsc.connect(kickGain);
    kickGain.connect(this.percussionGain);
    kickOsc.start(now);
    kickOsc.stop(now + 0.35);
  }

  /* ---------------- 2. Station-Specific Sonification Routines ---------------- */

  startStationSonification(dataset) {
    this.init();
    this.resume();
    this.stopStationSonification();
    this.isPlaying = true;

    // Start Choir Pad by default
    this.playChoirPad();

    // Loop clocked instruments based on station
    if (dataset.id === 'svs-5011-iss-lightning') {
      this.arpTimer = setInterval(() => {
        if (!this.isPlaying) return;
        this.triggerOrbitalPercussion(Math.random() > 0.3 ? 0.9 : 0.5);
      }, 350);
    } else if (dataset.id === 'svs-5313-night-lights-india') {
      const notes = [SCALE.C4, SCALE.E4, SCALE.G4, SCALE.A4, SCALE.C5, SCALE.A4];
      let step = 0;
      this.arpTimer = setInterval(() => {
        if (!this.isPlaying) return;
        this.playGlockenspielNote(notes[step % notes.length], 0.7);
        step++;
      }, 260);
    } else {
      const marimbaNotes = [SCALE.C3, SCALE.E3, SCALE.G3, SCALE.A3, SCALE.C4];
      let step = 0;
      this.arpTimer = setInterval(() => {
        if (!this.isPlaying) return;
        this.playMarimbaNote(marimbaNotes[step % marimbaNotes.length], 0.65);
        step++;
      }, 420);
    }
  }

  stopStationSonification() {
    this.isPlaying = false;
    this.stopChoirPad();
    if (this.arpTimer) {
      clearInterval(this.arpTimer);
      this.arpTimer = null;
    }
  }

  /* ---------------- 3. Spoken Accessibility Voices (window.speechSynthesis) ---------------- */

  speakText(text, priority = false) {
    if (!this.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    try {
      if (priority) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  speakStationOverview(dataset) {
    const prompt = `Now loading ${dataset.shortName}. ${dataset.voiceName}. ${dataset.voiceDescription}. Current telemetry: ${dataset.telemetry.instrument || 'NASA SVS Observation Array'}.`;
    this.speakText(prompt, true);
  }

  speakRegionalTelemetry(regionName, telemetryText) {
    const prompt = `Regional Telemetry for ${regionName}. ${telemetryText}.`;
    this.speakText(prompt, true);
  }

  toggleSpeech(enabled) {
    this.speechEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /* ---------------- 4. Master Volume & Analyser ---------------- */
  setMasterVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  setChannelVolume(channelName, val) {
    const gainMap = {
      choir: this.choirGain,
      marimba: this.marimbaGain,
      glockenspiel: this.glockenspielGain,
      percussion: this.percussionGain
    };
    if (gainMap[channelName] && this.ctx) {
      gainMap[channelName].gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
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

export const voicesEngine = new VoicesAudioEngine();
