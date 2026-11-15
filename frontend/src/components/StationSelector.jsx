import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import StationCard from './StationCard';

const GROUPS = [
  { id: 'all', label: 'All stations' },
  { id: 'biosphere', label: 'Biosphere' },
  { id: 'atmosphere', label: 'Atmosphere' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'urban', label: 'Earth & beyond' }
];

const CATEGORY_IDS = {
  biosphere: ['svs-4950', 'svs-5196'],
  atmosphere: ['svs-4960', 'svs-5011', 'svs-5533', 'svs-5669'],
  ocean: ['svs-5425', 'svs-3912'],
  urban: ['svs-5313', 'svs-13786']
};

export default function StationSelector({ stations, selectedStation, onSelectStation, canInteract = false, onRequireAuth }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const visible = useMemo(() => stations.filter(station => {
    if (category !== 'all' && !CATEGORY_IDS[category]?.includes(station.id)) return false;
    const query = search.trim().toLocaleLowerCase();
    return !query || `${station.title} ${station.shortName} ${station.category} ${station.svsId}`.toLocaleLowerCase().includes(query);
  }), [stations, category, search]);

  return (
    <section id="stations" className="es-stations" aria-labelledby="es-stations-title">
      <div className="es-container">
        <div className="es-section-heading">
          <div><p className="es-kicker">03 / THE COLLECTION</p><h2 id="es-stations-title">Choose your Earth story.</h2><p>Explore NASA Scientific Visualization Studio references. Each station has its own artistic audio concept and scientific context.</p></div>
          <a className="es-text-link" href="https://svs.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">Visit NASA SVS <ArrowUpRight size={17} /></a>
        </div>
        <div className="es-filterbar">
          <div role="group" aria-label="Station category" className="es-filterbar__categories">
            {GROUPS.map(group => <button key={group.id} type="button" aria-pressed={category === group.id} onClick={() => setCategory(group.id)}>{group.label}</button>)}
          </div>
          <label className="es-filterbar__search"><Search size={17}/><span className="sr-only">Search stations</span><input type="search" placeholder="Search Earth stories" value={search} onChange={event => setSearch(event.target.value)} /></label>
        </div>
        <p className="es-results" aria-live="polite">Showing {visible.length} of {stations.length} stations</p>
        {visible.length ? <div className="es-station-grid">{visible.map(station => <StationCard key={station.id} station={station} isSelected={selectedStation?.id === station.id} onSelect={onSelectStation} canInteract={canInteract} onRequireAuth={onRequireAuth} />)}</div> : <p className="es-empty">No stations match your search. Try another category or keyword.</p>}
      </div>
    </section>
  );
}
