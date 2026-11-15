import React from 'react';
import { Activity, ArrowRight, ArrowUpRight, Cloud, Headphones, LockKeyhole, Thermometer, Wind } from 'lucide-react';

const VARIABLES = [
  { name: 'Temperature', code: 'T2M', unit: '°C', icon: Thermometer, color: 'cobalt' },
  { name: 'Relative humidity', code: 'RH2M', unit: '%', icon: Cloud, color: 'red' },
  { name: 'Wind speed', code: 'WS2M', unit: 'm/s', icon: Wind, color: 'gold' }
];

export default function GuestSciencePreview({ onRequestAuth }) {
  return (
    <section id="scientific-jukebox-preview" className="es-science-preview" aria-labelledby="es-science-title">
      <div className="es-container es-science-preview__grid">
        <div className="es-science-preview__story">
          <p className="es-kicker">02 / HEAR THE DATA</p>
          <h2 id="es-science-title">Science, transformed into sound.</h2>
          <p>Temperature becomes melody. Humidity shapes harmony. Wind becomes texture. Each layer comes from NASA POWER daily gridded data at a location you choose.</p>
          <div className="es-science-preview__facts"><span><Activity size={17}/> Real scientific values</span><span><Headphones size={17}/> Artistic pitch mapping</span></div>
          <button type="button" className="es-button es-button--cobalt" onClick={() => onRequestAuth?.('signup')}>Create your free account <ArrowRight size={18}/></button>
          <button type="button" className="es-text-link es-science-preview__signin" onClick={() => onRequestAuth?.('login')}>Already a member? Sign in <ArrowUpRight size={16}/></button>
          <p className="es-science-preview__note"><LockKeyhole size={14}/> Account required to load data or play audio.</p>
        </div>
        <div className="es-climate-card" aria-label="Illustrative climate data preview">
          <div className="es-climate-card__top"><div><p>EARTHSONIC / SCIENTIFIC JUKEBOX</p><h3>Climate Symphony</h3></div><span className="es-climate-card__lock"><LockKeyhole size={13}/> Preview</span></div>
          <div className="es-climate-card__variables">{VARIABLES.map(({ name, code, unit, icon: Icon, color }) => <div className={`es-climate-card__variable es-climate-card__variable--${color}`} key={code}><Icon size={19}/><span>{name}<small>{code} · {unit}</small></span></div>)}</div>
          <div className="es-climate-card__wave" aria-hidden="true">{[29,47,42,68,51,79,59,65,49,84,65,37,58,76,42,56,71,45,59,82,54,68,46,79].map((height,index) => <i key={index} style={{height:`${height}%`}}/>)}</div>
          <p className="es-climate-card__disclaimer">Illustrative graphic — not live NASA measurements.</p>
          <button className="es-climate-card__action" type="button" onClick={() => onRequestAuth?.('login')}><LockKeyhole size={16}/> Sign in to activate the workstation <ArrowUpRight size={16}/></button>
        </div>
      </div>
    </section>
  );
}
