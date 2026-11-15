import React, { useEffect, useRef, useState } from 'react';
import './CinematicEarthHero.css';

const SIZE = 300;
const RADIUS = 142;
const CENTER = SIZE / 2;
const LATITUDE_TILT = 12 * Math.PI / 180;
const SIN_TILT = Math.sin(LATITUDE_TILT);
const COS_TILT = Math.cos(LATITUDE_TILT);
const VIEW_SAMPLES = [];

for (let y = 0; y < SIZE; y += 1) {
  for (let x = 0; x < SIZE; x += 1) {
    const east = (x - CENTER) / RADIUS;
    const north = (CENTER - y) / RADIUS;
    const squared = east * east + north * north;
    if (squared > 1) continue;
    const depth = Math.sqrt(1 - squared);
    const latitude = Math.asin(Math.max(-1, Math.min(1, depth * SIN_TILT + north * COS_TILT)));
    const longitudeOffset = Math.atan2(east, depth * COS_TILT - north * SIN_TILT);
    const lighting = 0.29 + 0.82 * Math.max(0, 0.88 * depth - 0.28 * east + 0.16 * north);
    const opacity = Math.max(0, Math.min(1, (1 - squared) * 58));
    VIEW_SAMPLES.push({
      offset: (y * SIZE + x) * 4,
      latitude: latitude * 180 / Math.PI,
      longitudeOffset: longitudeOffset * 180 / Math.PI,
      lighting,
      opacity
    });
  }
}

function wrapLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 600;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        reject(new Error('Canvas 2D rendering is not available'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    };
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

export default function CinematicEarthHero({ onExplore }) {
  const canvasRef = useRef(null);
  const angleRef = useRef(68);
  const pointerRef = useRef(null);
  const lastInteractionRef = useRef(0);
  const [textureStatus, setTextureStatus] = useState('loading');

  useEffect(() => {
    let alive = true;
    let frameId = null;
    let texture = null;
    let visible = true;
    let lastFrame = 0;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? false; }, { threshold: 0.01 })
      : null;
    observer?.observe(canvas);

    const paint = () => {
      if (!texture) return;
      const buffer = context.createImageData(SIZE, SIZE);
      const pixels = buffer.data;
      const source = texture.data;
      const width = texture.width;
      const height = texture.height;
      const angle = angleRef.current;

      for (const point of VIEW_SAMPLES) {
        const longitude = wrapLongitude(angle + point.longitudeOffset);
        const x = Math.min(width - 1, Math.max(0, Math.floor(((longitude + 180) / 360) * width)));
        const y = Math.min(height - 1, Math.max(0, Math.floor(((90 - point.latitude) / 180) * height)));
        const sourceIndex = (y * width + x) * 4;
        const dest = point.offset;
        pixels[dest] = Math.min(255, source[sourceIndex] * point.lighting);
        pixels[dest + 1] = Math.min(255, source[sourceIndex + 1] * point.lighting);
        pixels[dest + 2] = Math.min(255, source[sourceIndex + 2] * point.lighting);
        pixels[dest + 3] = Math.round(255 * point.opacity);
      }

      context.clearRect(0, 0, SIZE, SIZE);
      context.putImageData(buffer, 0, 0);
    };

    const tick = (now) => {
      if (!alive) return;
      const delta = Math.min(120, Math.max(0, now - (lastFrame || now)));
      if (visible && texture && now - lastFrame >= 90) {
        if (!media.matches && !pointerRef.current && now - lastInteractionRef.current > 2200) {
          angleRef.current = wrapLongitude(angleRef.current + delta * 0.0025);
        }
        paint();
        lastFrame = now;
      }
      frameId = requestAnimationFrame(tick);
    };

    const renderImmediately = () => { if (alive) paint(); };
    const mediaChanged = () => renderImmediately();
    media.addEventListener?.('change', mediaChanged);

    loadTexture('/earthsonic-earth-nasa.jpg')
      .catch(() => loadTexture('/earthsonic-earth-texture.png'))
      .then((imageData) => {
        if (!alive) return;
        texture = imageData;
        setTextureStatus('ready');
        renderImmediately();
      })
      .catch(() => { if (alive) setTextureStatus('unavailable'); });

    frameId = requestAnimationFrame(tick);
    return () => {
      alive = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      observer?.disconnect();
      media.removeEventListener?.('change', mediaChanged);
    };
  }, []);

  const pointerDown = (event) => {
    pointerRef.current = { id: event.pointerId, x: event.clientX };
    lastInteractionRef.current = performance.now();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event) => {
    if (!pointerRef.current || pointerRef.current.id !== event.pointerId) return;
    const delta = event.clientX - pointerRef.current.x;
    angleRef.current = wrapLongitude(angleRef.current - delta * 0.42);
    pointerRef.current.x = event.clientX;
    lastInteractionRef.current = performance.now();
  };

  const pointerUp = (event) => {
    if (pointerRef.current?.id === event.pointerId) {
      pointerRef.current = null;
      lastInteractionRef.current = performance.now();
    }
  };

  const rotateWithKeyboard = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      angleRef.current = wrapLongitude(angleRef.current + (event.key === 'ArrowLeft' ? -15 : 15));
      lastInteractionRef.current = performance.now();
    }
  };

  return (
    <div className="cinematic-earth" aria-label="Illustrated globe showing NASA Blue Marble Earth imagery">
      <div className="cinematic-earth__orbit cinematic-earth__orbit--one" aria-hidden="true" />
      <div className="cinematic-earth__orbit cinematic-earth__orbit--two" aria-hidden="true" />
      <div className="cinematic-earth__disk">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="cinematic-earth__canvas"
          role="img"
          aria-label="NASA Blue Marble Earth sphere. Drag to rotate, or focus and use left and right arrow keys."
          tabIndex={0}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onKeyDown={rotateWithKeyboard}
        />
        {textureStatus !== 'ready' && (
          <p className="cinematic-earth__fallback" aria-live="polite">
            {textureStatus === 'loading' ? 'Rendering Earth…' : 'Earth imagery unavailable'}
          </p>
        )}
      </div>
      <div className="cinematic-earth__credit">NASA BLUE MARBLE <span>· HISTORICAL COMPOSITE</span></div>
      <button type="button" className="cinematic-earth__explore" onClick={onExplore}>Explore the science <span aria-hidden="true">↗</span></button>
      <p className="cinematic-earth__instruction">Drag the globe or use the arrow keys to rotate</p>
    </div>
  );
}
