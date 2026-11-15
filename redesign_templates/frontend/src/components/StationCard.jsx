import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Headphones, LockKeyhole } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export default function StationCard({ station, isSelected, onSelect, canInteract = false, onRequireAuth }) {
  const [previewing, setPreviewing] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
  }, []);

  function openStation() {
    if (!canInteract) {
      onSelect(station);
      return;
    }
    onSelect(station);
  }

  function audition(event) {
    event.stopPropagation();
    if (!canInteract) {
      onSelect(station);
      return;
    }
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setPreviewing(true);
    audioEngine.playStationPreview(station.id);
    audioEngine.speakStationInfo(station);
    timeoutRef.current = setTimeout(() => setPreviewing(false), 900);
  }

  return (
    <article className={`es-station ${isSelected && canInteract ? 'es-station--selected' : ''}`}>
      <button type="button" className="es-station__image-button" onClick={openStation} aria-label={`Explore ${station.title}`}>
        <img src={station.thumbnail} alt="" loading="lazy" />
        <span className="es-station__image-label">{station.category}</span>
        <span className="es-station__image-arrow"><ArrowUpRight size={18} /></span>
      </button>
      <div className="es-station__body">
        <div className="es-station__meta"><span>{station.svsId}</span><span>{station.voiceName}</span></div>
        <h3>{station.shortName || station.title}</h3>
        <p className="es-station__description">{station.description}</p>
        <div className="es-station__mapping"><span>ARTISTIC SOUND MAPPING</span><p>{station.soundMapping?.[0]?.sound || station.sonificationApproach}</p></div>
        <div className="es-station__footer">
          <button type="button" className="es-station__open" onClick={openStation}>
            {isSelected && canInteract ? <Check size={17} /> : !canInteract ? <LockKeyhole size={16} /> : <ArrowUpRight size={17} />}
            {isSelected && canInteract ? 'Selected' : canInteract ? 'Open station' : 'Sign in to explore'}
          </button>
          <button type="button" className="es-station__listen" onClick={audition} aria-label={canInteract ? `Hear preview for ${station.shortName}` : 'Sign in to hear this preview'} title={canInteract ? 'Listen to sound preview' : 'Login required'}>
            {canInteract ? <Headphones size={18} className={previewing ? 'animate-pulse' : ''} /> : <LockKeyhole size={17} />}
          </button>
          <a href={station.svsUrl} className="es-station__source" target="_blank" rel="noopener noreferrer" aria-label={`NASA SVS source for ${station.title}`}>NASA source <ArrowUpRight size={13} /></a>
        </div>
      </div>
    </article>
  );
}
