import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Globe2, MapPin, RotateCcw } from 'lucide-react';
import { clampLatitude, normalizeLocation, projectLocation, unprojectLocation, wrapLongitude } from '../services/globeMath.mjs';
import './GlobeLocationPicker.css';
import { getVisibleCountryLabels } from '../services/countryLabels.mjs';

const DIMENSION = 380;
const RADIUS = 174;
const CENTER = DIMENSION / 2;
const LOCATIONS = [
  { label: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
  { label: 'New York', latitude: 40.7128, longitude: -74.006 },
  { label: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { label: 'Sydney', latitude: -33.8688, longitude: 151.2093 }
];

function formatCoordinate(value, positive, negative) {
  const absolute = Math.abs(Number(value));
  return `${absolute.toFixed(4)}° ${Number(value) < 0 ? negative : positive}`;
}

export default function GlobeLocationPicker({ latitude, longitude, onChange, title = 'Choose a location on Earth' }) {
  const canvasRef = useRef(null);
  const textureRef = useRef(null);
  const viewRef = useRef({ latitude: Number(latitude) || 0, longitude: Number(longitude) || 0 });
  const dragRef = useRef(null);
  const rafRef = useRef(null);
  const latestRef = useRef({ latitude, longitude });
  const [manualLat, setManualLat] = useState(String(latitude));
  const [manualLon, setManualLon] = useState(String(longitude));
  const [manualError, setManualError] = useState('');
  const [rotation, setRotation] = useState(0);
  const [showCountries, setShowCountries] = useState(true);
  const showCountriesRef = useRef(true);

  latestRef.current = { latitude, longitude };

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const frame = context.createImageData(DIMENSION, DIMENSION);
    const dest = frame.data;
    const texture = textureRef.current;
    const view = viewRef.current;
    const phi0 = view.latitude * Math.PI / 180;
    const sin0 = Math.sin(phi0);
    const cos0 = Math.cos(phi0);
    const texData = texture?.data;
    const texWidth = texture?.width || 1;
    const texHeight = texture?.height || 1;

    for (let py = 0; py < DIMENSION; py += 1) {
      const y = (CENTER - py) / RADIUS;
      for (let px = 0; px < DIMENSION; px += 1) {
        const x = (px - CENTER) / RADIUS;
        const r2 = x * x + y * y;
        if (r2 > 1) continue;
        const z = Math.sqrt(Math.max(0, 1 - r2));
        const latitudeRad = Math.asin(Math.max(-1, Math.min(1, z * sin0 + y * cos0)));
        const longitudeRad = Math.atan2(x, z * cos0 - y * sin0);
        const sampleLon = wrapLongitude(view.longitude + longitudeRad * 180 / Math.PI);
        const sampleLat = latitudeRad * 180 / Math.PI;
        const ix = Math.max(0, Math.min(texWidth - 1, Math.round((sampleLon + 180) / 360 * (texWidth - 1))));
        const iy = Math.max(0, Math.min(texHeight - 1, Math.round((90 - sampleLat) / 180 * (texHeight - 1))));
        const si = (iy * texWidth + ix) * 4;
        const di = (py * DIMENSION + px) * 4;
        const light = 0.25 + 0.83 * Math.max(0, 0.94 * z - 0.29 * x + 0.16 * y);
        dest[di] = Math.min(255, (texData ? texData[si] : 11) * light);
        dest[di + 1] = Math.min(255, (texData ? texData[si + 1] : 61) * light);
        dest[di + 2] = Math.min(255, (texData ? texData[si + 2] : 145) * light);
        dest[di + 3] = Math.min(255, 255 * Math.min(1, (1 - r2) * 180));
      }
    }

    context.clearRect(0, 0, DIMENSION, DIMENSION);
    context.putImageData(frame, 0, 0);

    const halo = context.createRadialGradient(CENTER, CENTER, RADIUS * 0.8, CENTER, CENTER, RADIUS + 10);
    halo.addColorStop(0, 'rgba(11,61,145,0)');
    halo.addColorStop(0.70, 'rgba(11,61,145,0.06)');
    halo.addColorStop(0.96, 'rgba(11,61,145,0.28)');
    halo.addColorStop(1, 'rgba(11,61,145,0)');
    context.fillStyle = halo;
    context.fillRect(0, 0, DIMENSION, DIMENSION);
    context.beginPath();
    context.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(11,61,145,0.27)';
    context.lineWidth = 1.5;
    context.stroke();

    if (showCountriesRef.current) {
      context.save();
      context.font = '650 10px system-ui, -apple-system, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.lineJoin = 'round';
      for (const country of getVisibleCountryLabels(view.latitude, view.longitude)) {
        const cx = CENTER + country.x * RADIUS;
        const cy = CENTER - country.y * RADIUS;
        context.globalAlpha = Math.min(1, Math.max(0.65, country.depth));
        context.lineWidth = 3.4;
        context.strokeStyle = 'rgba(5, 17, 31, 0.95)';
        context.strokeText(country.name, cx, cy);
        context.fillStyle = '#FAFBFC';
        context.fillText(country.name, cx, cy);
      }
      context.restore();
    }

    const selected = normalizeLocation(latestRef.current.latitude, latestRef.current.longitude);
    if (selected) {
      const marker = projectLocation(selected.latitude, selected.longitude, view.latitude, view.longitude);
      if (marker.visible) {
        const x = CENTER + marker.x * RADIUS;
        const y = CENTER - marker.y * RADIUS;
        context.beginPath();
        context.arc(x, y, 12, 0, Math.PI * 2);
        context.fillStyle = 'rgba(252,61,33,0.22)';
        context.fill();
        context.beginPath();
        context.arc(x, y, 5.5, 0, Math.PI * 2);
        context.fillStyle = '#FC3D21';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#FAF9F6';
        context.stroke();
      }
    }
  }

  function requestDraw() {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      if (!canvasRef.current) return;
      const buffer = document.createElement('canvas');
      buffer.width = image.naturalWidth;
      buffer.height = image.naturalHeight;
      const ctx = buffer.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);
      textureRef.current = ctx.getImageData(0, 0, buffer.width, buffer.height);
      requestDraw();
    };
    const textureChoices = ['/earthsonic-earth-nasa.jpg', '/earthsonic-earth-texture.png'];
    let textureIndex = 0;
    image.onerror = () => {
      textureIndex += 1;
      if (textureIndex < textureChoices.length) image.src = textureChoices[textureIndex];
    };
    image.src = textureChoices[0];
    requestDraw();
    return () => {
      image.onload = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    showCountriesRef.current = showCountries;
    requestDraw();
  }, [showCountries]);

  useEffect(() => {
    setManualLat(String(latitude));
    setManualLon(String(longitude));
    requestDraw();
  }, [latitude, longitude, rotation]);

  function chooseLocation(next) {
    const valid = normalizeLocation(next.latitude, next.longitude);
    if (!valid) return;
    viewRef.current = { latitude: valid.latitude, longitude: valid.longitude };
    setManualError('');
    onChange({ latitude: valid.latitude.toFixed(4), longitude: valid.longitude.toFixed(4) });
    setRotation(n => n + 1);
    requestDraw();
  }

  function positionFromEvent(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * DIMENSION,
      y: (event.clientY - rect.top) / rect.height * DIMENSION
    };
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const point = positionFromEvent(event);
    dragRef.current = { x: point.x, y: point.y, latitude: viewRef.current.latitude, longitude: viewRef.current.longitude, dragged: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragRef.current) return;
    const point = positionFromEvent(event);
    const drag = dragRef.current;
    const dx = point.x - drag.x;
    const dy = point.y - drag.y;
    if (Math.hypot(dx, dy) < 5 && !drag.dragged) return;
    drag.dragged = true;
    viewRef.current = {
      longitude: wrapLongitude(drag.longitude - dx * 0.45),
      latitude: clampLatitude(drag.latitude + dy * 0.36)
    };
    requestDraw();
  }

  function onPointerUp(event) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.dragged) return;
    const point = positionFromEvent(event);
    const x = (point.x - CENTER) / RADIUS;
    const y = (CENTER - point.y) / RADIUS;
    const result = unprojectLocation(x, y, viewRef.current.latitude, viewRef.current.longitude);
    if (result) chooseLocation(result);
  }

  function onKeyDown(event) {
    const view = viewRef.current;
    let next = null;
    if (event.key === 'ArrowLeft') next = { ...view, longitude: wrapLongitude(view.longitude - 12) };
    if (event.key === 'ArrowRight') next = { ...view, longitude: wrapLongitude(view.longitude + 12) };
    if (event.key === 'ArrowUp') next = { ...view, latitude: clampLatitude(view.latitude + 10) };
    if (event.key === 'ArrowDown') next = { ...view, latitude: clampLatitude(view.latitude - 10) };
    if (next) {
      event.preventDefault();
      viewRef.current = next;
      setRotation(n => n + 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseLocation(view);
    }
  }

  function savePreciseLocation(event) {
    event.preventDefault();
    const location = normalizeLocation(manualLat, manualLon);
    if (!location) {
      setManualError('Use latitude from −90° to 90° and longitude from −180° to 180°.');
      return;
    }
    chooseLocation(location);
  }

  return (
    <section className="earthsonic-globe-picker" aria-label="Choose a location using the interactive Earth globe">
      <div className="earthsonic-globe-header">
        <div>
          <p className="earthsonic-globe-eyebrow"><Globe2 size={14} /> NASA EARTH EXPLORER</p>
          <h3>{title}</h3>
          <p>Drag to rotate. Tap anywhere on the globe to choose a NASA data location.</p>
        </div>
        <div className="earthsonic-globe-header-actions">
          <button type="button" className="earthsonic-globe-label-toggle" onClick={() => setShowCountries(value => !value)} aria-pressed={showCountries}>
            Country names: {showCountries ? 'On' : 'Off'}
          </button>
          <button type="button" className="earthsonic-globe-reset" onClick={() => { const selected = normalizeLocation(latitude, longitude); if (selected) { viewRef.current = selected; setRotation(n => n + 1); } }}>
            <Crosshair size={16} /> Center selection
          </button>
        </div>
      </div>
      <div className="earthsonic-globe-layout">
        <div className="earthsonic-globe-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={DIMENSION}
            height={DIMENSION}
            role="button"
            tabIndex={0}
            aria-label="Interactive Earth sphere. Drag or use arrow keys to rotate. Click or press Enter to select a location."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { dragRef.current = null; }}
            onKeyDown={onKeyDown}
          />
          <div className="earthsonic-globe-hint" aria-hidden="true">DRAG TO ROTATE · CLICK TO SELECT</div>
        </div>
        <div className="earthsonic-globe-aside">
          <div className="earthsonic-globe-selected" aria-live="polite">
            <p><MapPin size={16} /> Selected NASA location</p>
            <strong>{formatCoordinate(latitude, 'N', 'S')}</strong>
            <strong>{formatCoordinate(longitude, 'E', 'W')}</strong>
            <span>Coordinates are sent automatically when you load NASA data.</span>
          </div>
          <p className="earthsonic-globe-label">Quick locations</p>
          <div className="earthsonic-globe-presets">
            {LOCATIONS.map(place => (
              <button type="button" key={place.label} onClick={() => chooseLocation(place)}>{place.label}</button>
            ))}
          </div>
          <details className="earthsonic-globe-precise">
            <summary>Enter precise coordinates instead</summary>
            <form onSubmit={savePreciseLocation}>
              <label>Latitude <input type="number" min="-90" max="90" step="any" value={manualLat} onChange={event => setManualLat(event.target.value)} /></label>
              <label>Longitude <input type="number" min="-180" max="180" step="any" value={manualLon} onChange={event => setManualLon(event.target.value)} /></label>
              <button type="submit"><RotateCcw size={14} /> Set location</button>
            </form>
            {manualError && <p role="alert" className="earthsonic-globe-error">{manualError}</p>}
          </details>
          <p className="earthsonic-globe-footnote">The globe selects geographic coordinates, not real-time GPS location. NASA POWER supplies gridded scientific data for your chosen point.</p>
        </div>
      </div>
    </section>
  );
}
