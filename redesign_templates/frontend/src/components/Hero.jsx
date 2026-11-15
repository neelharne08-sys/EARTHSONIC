import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, AudioLines, Globe2, Headphones, LockKeyhole, Satellite, Volume2 } from 'lucide-react';
import CinematicEarthHero from './CinematicEarthHero';
import { audioEngine } from '../services/audioEngine';
import './CinematicHeroLayout.css';

const METRICS = [
  { number: '10', description: 'NASA visualization references', icon: Satellite },
  { number: '03', description: 'Real NASA POWER variables', icon: AudioLines },
  { number: '01', description: 'Living planet to explore', icon: Globe2 }
];

export default function Hero({ onLaunchJukebox, canInteract = false, onRequireAuth }) {
  const [previewing, setPreviewing] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
  }, []);

  function audition() {
    if (!canInteract) {
      onRequireAuth?.('login');
      return;
    }
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setPreviewing(true);
    audioEngine.playStationPreview('svs-4950');
    timeoutRef.current = setTimeout(() => setPreviewing(false), 900);
  }

  function exploreScience() {
    const target = document.getElementById(canInteract ? 'earthsonic-science-section' : 'scientific-jukebox-preview');
    target?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  return (
    <section className="es-hero" aria-labelledby="es-hero-title">
      <div className="es-hero__grid">
        <div className="es-hero__copy">
          <p className="es-overline"><span className="es-signal" /> NASA SPACE APPS CHALLENGE 2026 <span className="es-overline__rule" /> TEAM VERTEX</p>
          <p className="es-hero__index">01 / EARTH INFORMATION JUKEBOX · PS14</p>
          <h1 id="es-hero-title">The Earth has a story. <em>Listen to it.</em></h1>
          <p className="es-hero__lead">Explore the planet through NASA visualizations and hear real NASA POWER temperature, humidity and wind values transformed into sound.</p>
          <div className="es-hero__actions">
            <button type="button" className="es-button es-button--red" onClick={onLaunchJukebox}>
              {canInteract ? 'Open Earth Jukebox' : 'Start exploring'} <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="es-button es-button--outline" onClick={exploreScience}>
              <Headphones size={18} aria-hidden="true" /> Explore the science
            </button>
          </div>
          <button type="button" className="es-hero__audition" onClick={audition}>
            {canInteract ? <Volume2 size={17} /> : <LockKeyhole size={17} />}
            {canInteract ? (previewing ? 'Synthesizing preview…' : 'Hear a station preview') : 'Sign in to listen and interact'}
          </button>
          <p className="es-hero__disclosure">NASA supplies the data. Earthsonic designs the sound mappings. This is not NASA-recorded audio.</p>
        </div>
        <div className="es-hero__planet"><CinematicEarthHero onExplore={exploreScience}/></div>
      </div>
      <div className="es-hero__stats">
        {METRICS.map(({ number, description, icon: Icon }) => (
          <div className="es-hero__stat" key={number}>
            <Icon size={20} aria-hidden="true" />
            <strong>{number}</strong>
            <span>{description}</span>
          </div>
        ))}
        <div className="es-hero__stat es-hero__stat--edition"><strong>NASA 2026</strong><span>Independent Team Vertex project</span></div>
      </div>
    </section>
  );
}
