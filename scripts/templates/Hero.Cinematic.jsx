import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, AudioLines, Globe2, Radio, Satellite, Volume2 } from 'lucide-react';
import CinematicEarthHero from './CinematicEarthHero';
import { audioEngine } from '../services/audioEngine';
import { NASA_CHALLENGE_INFO } from '../data/stations';
import './CinematicHeroLayout.css';

const OVERVIEW = [
  { title: '10', label: 'Curated NASA SVS sources', icon: Satellite },
  { title: '3', label: 'NASA POWER climate voices', icon: AudioLines },
  { title: '1', label: 'Living planet to explore', icon: Globe2 }
];

export default function Hero({ onLaunchJukebox, canInteract = false, onRequireAuth }) {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const timeoutRef = useRef(null);
  useEffect(() => () => { if (timeoutRef.current !== null) clearTimeout(timeoutRef.current); }, []);

  function audition() {
    if (!canInteract) {
      onRequireAuth?.('login');
      return;
    }
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setIsPlayingDemo(true);
    audioEngine.playStationPreview('svs-4950');
    timeoutRef.current = setTimeout(() => setIsPlayingDemo(false), 900);
  }

  function exploreScience() {
    const selector = canInteract ? '#scientific-jukebox' : '#scientific-jukebox-preview';
    const section = document.querySelector(selector);
    section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <section className="cinematic-hero border-b border-[#DCD7CD]" aria-labelledby="cinematic-title">
      <div className="cinematic-hero__wrapper">
        <div className="cinematic-hero__intro">
          <div className="cinematic-hero__eyebrow"><span className="cinematic-hero__signal" /> NASA SPACE APPS CHALLENGE 2026 <span className="cinematic-hero__slash">/</span> TEAM VERTEX</div>
          <p className="cinematic-hero__chapter">EARTH INFORMATION JUKEBOX <span>· PS14</span></p>
          <h1 id="cinematic-title" className="cinematic-hero__title">Listen to Earth's <em>living pulse.</em></h1>
          <p className="cinematic-hero__description">A new way to experience our planet. Explore NASA Earth visualizations, then hear real NASA POWER temperature, humidity, and wind data translated into sound.</p>
          <div className="cinematic-hero__actions">
            <button type="button" onClick={onLaunchJukebox} className="cinematic-hero__primary"><Radio size={18}/> {canInteract ? 'Launch Earth Jukebox' : 'Sign in to explore'} <ArrowRight size={17}/></button>
            <button type="button" onClick={audition} className="cinematic-hero__secondary"><Volume2 size={18}/> {canInteract ? (isPlayingDemo ? 'Synthesizing…' : 'Audition sound') : 'Preview after sign in'}</button>
          </div>
          <div className="cinematic-hero__source"><span aria-hidden="true">◉</span> Public Earth preview · Interactive science requires an account</div>
        </div>
        <div className="cinematic-hero__visual"><CinematicEarthHero onExplore={exploreScience}/></div>
      </div>
      <div className="cinematic-hero__overview">
        {OVERVIEW.map(({ title, label, icon: Icon }) => (
          <div key={title} className="cinematic-hero__metric"><Icon size={18} aria-hidden="true"/><strong>{title}</strong><span>{label}</span></div>
        ))}
        <div className="cinematic-hero__edition">{NASA_CHALLENGE_INFO.edition}</div>
      </div>
    </section>
  );
}
