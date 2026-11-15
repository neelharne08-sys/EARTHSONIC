export class LiveSonifier {
  constructor() {
    this.context = null;
    this.oscillator = null;
    this.gain = null;
    this.running = false;
  }

  async start() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
      this.context = new AudioContextClass();
    }
    await this.context.resume();
    if (this.running) return;
    this.oscillator = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 240;
    this.gain.gain.setValueAtTime(0, this.context.currentTime);
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.oscillator.start();
    this.gain.gain.setTargetAtTime(0.065, this.context.currentTime, 0.06);
    this.running = true;
  }

  setFrequency(frequency) {
    if (!this.running || !this.oscillator) return;
    this.oscillator.frequency.setTargetAtTime(frequency, this.context.currentTime, 0.045);
  }

  stop() {
    if (!this.running) return;
    this.gain.gain.setTargetAtTime(0, this.context.currentTime, 0.025);
    const oscillator = this.oscillator;
    const context = this.context;
    oscillator.stop(context.currentTime + 0.15);
    this.running = false;
    this.oscillator = null;
    this.gain = null;
  }
}
