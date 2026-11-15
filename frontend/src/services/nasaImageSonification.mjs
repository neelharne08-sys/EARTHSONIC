import { getNasaStill } from './nasaStills.mjs';

const SAMPLES = 100;
const ROWS = 70;

export function scanLuminance(imageData, width = SAMPLES, height = ROWS) {
  if (!(imageData?.length >= width * height * 4) || width < SAMPLES || height < 1) {
    throw new Error('Invalid NASA image pixel data');
  }
  const averages = [];
  for (let x = 0; x < SAMPLES; x += 1) {
    let total = 0;
    let count = 0;
    const left = Math.floor(x * width / SAMPLES);
    const right = Math.max(left + 1, Math.floor((x + 1) * width / SAMPLES));
    for (let py = 0; py < height; py += 1) {
      for (let px = left; px < right; px += 1) {
        const index = 4 * (py * width + px);
        total += (0.2126 * imageData[index] + 0.7152 * imageData[index + 1] + 0.0722 * imageData[index + 2]) / 255;
        count += 1;
      }
    }
    averages.push(count ? total / count : 0);
  }
  const min = Math.min(...averages);
  const max = Math.max(...averages);
  const brightness = averages.map(value => +(max === min ? 0.5 : (value - min) / (max - min)).toFixed(5));
  const frequencies = brightness.map(value => +(180 + 580 * value).toFixed(2));
  return {
    status: 'image',
    source: 'NASA SVS still image — normalized displayed luminance (not physical measurement)',
    brightness,
    frequencies,
    sample_count: SAMPLES,
    min_freq: Math.min(...frequencies),
    max_freq: Math.max(...frequencies)
  };
}

export async function loadNasaImageSonification(stationId) {
  const still = getNasaStill(stationId);
  if (!still) throw new Error('Unknown NASA SVS station');
  const image = new Image();
  image.decoding = 'async';
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error(`Download NASA images first: ${still.filename}`));
    image.src = still.local;
  });
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLES;
  canvas.height = ROWS;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Browser Canvas is unavailable');
  context.drawImage(image, 0, 0, SAMPLES, ROWS);
  const pixels = context.getImageData(0, 0, SAMPLES, ROWS);
  const analyzed = scanLuminance(pixels.data, SAMPLES, ROWS);
  return { ...analyzed, stationId, sourceUrl: still.sourceUrl };
}
