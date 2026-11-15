import React from 'react';
import { ArrowRight, ArrowUpRight, AudioLines, CalendarDays, Globe2, LockKeyhole, MapPin } from 'lucide-react';
import Hero from '../components/Hero';
import ScientificJukebox from '../components/ScientificJukebox';
import GuestSciencePreview from '../components/GuestSciencePreview';
import StationSelector from '../components/StationSelector';
import { NASA_CHALLENGE_INFO } from '../data/stations';

const STEPS = [
  { number: '01', title: 'Explore the planet', text: 'Rotate Earth and select a location. The globe converts your selection into coordinates for the NASA API.', icon: Globe2 },
  { number: '02', title: 'Choose a time window', text: 'Pick a daily date range, then load temperature, relative humidity, and wind from NASA POWER.', icon: CalendarDays },
  { number: '03', title: 'Listen to change', text: 'Compare measured values with three synchronized, generated sound layers and visual timelines.', icon: AudioLines }
];

export default function Home({ isAuthenticated = false, onRequestAuth, scienceStopSignal = 0, stations, selectedStation, onSelectStation, onLaunchJukebox }) {
  return (
    <div className="es-home editorial-home">
      <Hero onLaunchJukebox={onLaunchJukebox} onSelectStation={onSelectStation} canInteract={isAuthenticated} onRequireAuth={onRequestAuth}/>
      <section className="es-journey" aria-labelledby="es-journey-title">
        <div className="es-container">
          <div className="es-section-heading"><div><p className="es-kicker">HOW IT WORKS</p><h2 id="es-journey-title">From Earth observation to sound.</h2></div><p className="es-journey__aside">A multisensory approach to exploring NASA Earth science.</p></div>
          <div className="es-journey__grid">{STEPS.map(({ number, title, text, icon: Icon }) => <article key={number} className="es-step"><div className="es-step__top"><span>{number}</span><Icon size={22}/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>
      <div id="earthsonic-science-section" className="es-science-slot">
        {isAuthenticated ? <div className="es-container"><div className="es-section-heading"><div><p className="es-kicker">02 / LIVE SCIENCE WORKSTATION</p><h2>Listen to the climate.</h2><p>Select a location and dates, then play synchronized NASA POWER measurements.</p></div></div><ScientificJukebox stopSignal={scienceStopSignal}/></div> : <GuestSciencePreview onRequestAuth={onRequestAuth}/>}
      </div>
      <StationSelector stations={stations} selectedStation={selectedStation} onSelectStation={onSelectStation} canInteract={isAuthenticated} onRequireAuth={onRequestAuth}/>
      <section className="es-source-section"><div className="es-container"><details className="es-scientific-details"><summary><span><strong>Understand the science behind each station</strong><small>Explore the artistic data-to-sound mapping concepts and original NASA sources.</small></span><ArrowUpRight size={20}/></summary><div className="es-scientific-details__table"><table><thead><tr><th>NASA visualization</th><th>Artistic mapping concept</th><th>Original source</th></tr></thead><tbody>{stations.map(station => <tr key={station.id}><td><strong>{station.svsId}</strong> {station.shortName}</td><td>{station.sonificationApproach}</td><td><a href={station.svsUrl} target="_blank" rel="noopener noreferrer">NASA SVS <ArrowUpRight size={12}/></a></td></tr>)}</tbody></table></div></details></div></section>
      <section className="es-final-cta"><div className="es-container es-final-cta__inner"><div><p className="es-kicker">THE EARTH INFORMATION JUKEBOX</p><h2>Your planet is waiting to be heard.</h2><p>Explore Earth observations and discover how scientific values can become an audio experience.</p></div><button className="es-button es-button--red" type="button" onClick={onLaunchJukebox}>{isAuthenticated ? 'Open the Jukebox' : 'Sign in to begin'} <ArrowRight size={18}/></button></div></section>
      <footer className="es-footer"><div className="es-container"><span><strong>EARTHSONIC</strong> · Team Vertex · NASA Space Apps Challenge 2026</span><span><MapPin size={14}/> {NASA_CHALLENGE_INFO.edition} · Independent educational project</span></div></footer>
    </div>
  );
}
