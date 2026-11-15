export function normalizeSeries(values) {
  if (!values.length) return [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum;
  if (range < 0.000001) return values.map(() => 0.5);
  return values.map((value) => Math.max(0, Math.min(1, (value - minimum) / range)));
}

export function pitchFromIntensity(intensity) {
  return Math.round(180 + Math.max(0, Math.min(1, intensity)) * 580);
}

export function analyzeImage(image, samples = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = samples;
  canvas.height = 70;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixel = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const values = [];
  for (let x = 0; x < samples; x += 1) {
    let total = 0;
    for (let y = 0; y < canvas.height; y += 1) {
      const offset = (y * samples + x) * 4;
      const r = pixel[offset] / 255;
      const g = pixel[offset + 1] / 255;
      const b = pixel[offset + 2] / 255;
      total += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    values.push(total / canvas.height);
  }
  return { raw: values, normalized: normalizeSeries(values) };
}
