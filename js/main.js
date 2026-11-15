import { analyzeImage, pitchFromIntensity } from './analysis.js';
import { LiveSonifier } from './audio.js';

const visualImage = document.querySelector('#visualImage');
const sourceBadge = document.querySelector('#sourceBadge');
const sourceNote = document.querySelector('#sourceNote');
const frameTitle = document.querySelector('#frameTitle');
const frameDetails = document.querySelector('#frameDetails');
const brightnessValue = document.querySelector('#brightnessValue');
const frequencyValue = document.querySelector('#frequencyValue');
const scanMarker = document.querySelector('#scanMarker');
const plot = document.querySelector('#signalPlot');
const positionInput = document.querySelector('#positionInput');
const positionLabel = document.querySelector('#positionLabel');
const playbackState = document.querySelector('#playbackState');
const centerCore = document.querySelector('#centerCore');
const playButton = document.querySelector('#playButton');
const stopButton = document.querySelector('#stopButton');
const demoButton = document.querySelector('#demoButton');
const nasaButton = document.querySelector('#nasaButton');
const fileInput = document.querySelector('#fileInput');
const sonifier = new LiveSonifier();

const DEMO = 'assets/demo.svg';
const NASA = 'assets/nasa-eic-nightlights.jpg';
let signal = [];
let frameHandle = null;
let playing = false;
let beginTime = 0;
let beginProgress = 0;
let sourceObjectUrl = null;

function changeSourceLabel(mode, note, title, details) {
  sourceBadge.classList.toggle('nasa', mode === 'nasa');
  sourceBadge.classList.toggle('demo', mode !== 'nasa');
  sourceBadge.textContent = mode === 'nasa' ? 'NASA EIC FRAME' : mode === 'user' ? 'USER IMAGE / VERIFY SOURCE' : 'SIMULATED DEMO';
  sourceNote.textContent = note;
  frameTitle.textContent = title;
  frameDetails.textContent = details;
  demoButton.classList.toggle('active', mode === 'demo');
  nasaButton.classList.toggle('active', mode === 'nasa');
}

function renderPlot(progress) {
  const ctx = plot.getContext('2d');
  const width = plot.width;
  const height = plot.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#091729';
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1c3d4c';
  for (let y = 32; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  if (!signal.length) return;
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#66edc4';
  signal.forEach((value, index) => {
    const x = (index / (signal.length - 1)) * width;
    const y = height - 18 - value * (height - 36);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  const x = progress * width;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f9d589';
  ctx.stroke();
}

function setProgress(progress) {
  const position = Math.max(0, Math.min(1, progress));
  const index = Math.min(signal.length - 1, Math.round(position * (signal.length - 1)));
  const brightness = signal[index] ?? 0;
  const frequency = pitchFromIntensity(brightness);
  positionInput.value = String(Math.round(position * 100));
  positionLabel.textContent = `${Math.round(position * 100)}%`;
  brightnessValue.textContent = `${Math.round(brightness * 100)}%`;
  frequencyValue.textContent = `${frequency} Hz`;
  scanMarker.style.left = `${position * 100}%`;
  centerCore.style.transform = `scale(${0.85 + brightness * 0.9})`;
  sonifier.setFrequency(frequency);
  renderPlot(position);
}

function stopPlayback() {
  playing = false;
  if (frameHandle !== null) cancelAnimationFrame(frameHandle);
  frameHandle = null;
  sonifier.stop();
  playButton.querySelector('span').textContent = 'PLAY SONIFICATION';
  playbackState.textContent = 'READY TO LISTEN';
}

function tick(now) {
  if (!playing) return;
  const progress = beginProgress + (now - beginTime) / 12000;
  if (progress >= 1) {
    setProgress(1);
    stopPlayback();
    playbackState.textContent = 'SCAN COMPLETE';
    return;
  }
  setProgress(progress);
  frameHandle = requestAnimationFrame(tick);
}

async function play() {
  if (!signal.length) return;
  if (playing) {
    stopPlayback();
    return;
  }
  try {
    await sonifier.start();
    let start = Number(positionInput.value) / 100;
    if (start >= 1) start = 0;
    beginProgress = start;
    beginTime = performance.now();
    playing = true;
    playbackState.textContent = 'LIVE AUDIO ACTIVE';
    playButton.querySelector('span').textContent = 'PAUSE / STOP';
    frameHandle = requestAnimationFrame(tick);
  } catch (error) {
    playbackState.textContent = 'AUDIO UNAVAILABLE';
    sourceNote.textContent = error.message;
  }
}

function loadImage(url, mode, revokeUrl = false) {
  stopPlayback();
  const image = new Image();
  image.onload = () => {
    try {
      signal = analyzeImage(image).normalized;
      visualImage.src = url;
      visualImage.alt = mode === 'nasa' ? 'NASA Earth Information Center visualization of nighttime lights, 2012 to 2023' : 'Selected image undergoing feature sonification';
      changeSourceLabel(
        mode,
        mode === 'nasa' ? 'Authentic NASA EIC image loaded. Sonification uses relative visible brightness; it is not a calibrated measurement of artificial lighting.' : mode === 'user' ? 'Custom image loaded. Confirm and cite its source before using it in your NASA submission.' : 'Illustrative frame; not NASA data. Click Load NASA EIC frame after saving the official file to assets/nasa-eic-nightlights.jpg.',
        mode === 'nasa' ? 'NASA night-lights change · 2012–2023' : mode === 'user' ? 'Uploaded visual frame' : 'Illustrative demonstration',
        mode === 'nasa' ? 'NASA SVS · ID 5313' : mode === 'user' ? 'Local user file' : 'Generated example'
      );
      setProgress(0);
      if (sourceObjectUrl && sourceObjectUrl !== url) URL.revokeObjectURL(sourceObjectUrl);
      sourceObjectUrl = revokeUrl ? url : null;
    } catch (error) {
      sourceNote.textContent = `Unable to analyze the image: ${error.message}`;
      if (revokeUrl) URL.revokeObjectURL(url);
    }
  };
  image.onerror = () => {
    if (revokeUrl) URL.revokeObjectURL(url);
    sourceNote.textContent = 'NASA image not found. Download the official JPG linked above, save it as assets/nasa-eic-nightlights.jpg, and click Load NASA EIC frame again.';
    if (mode === 'nasa') sourceBadge.textContent = 'NASA FILE MISSING';
  };
  image.src = url;
}

positionInput.addEventListener('input', () => {
  stopPlayback();
  setProgress(Number(positionInput.value) / 100);
});
playButton.addEventListener('click', play);
stopButton.addEventListener('click', stopPlayback);
demoButton.addEventListener('click', () => loadImage(DEMO, 'demo'));
nasaButton.addEventListener('click', () => loadImage(NASA, 'nasa'));
fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;
  loadImage(URL.createObjectURL(file), 'user', true);
});
window.addEventListener('pagehide', stopPlayback);
loadImage(DEMO, 'demo');
