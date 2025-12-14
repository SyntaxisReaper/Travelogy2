import React from 'react';

interface MapToolbarProps {
  hasMapbox: boolean;
  provider: 'mapbox' | 'leaflet' | 'both';
  onProviderChange: (p: 'mapbox' | 'leaflet' | 'both') => void;
  mapboxStyle: 'dark' | 'streets' | 'satellite';
  onMapboxStyleChange: (s: 'dark' | 'streets' | 'satellite') => void;
  leafletStyle: 'dark' | 'osm' | 'topo';
  onLeafletStyleChange: (s: 'dark' | 'osm' | 'topo') => void;
  showRadar: boolean;
  onToggleRadar: () => void;
  onMaximize: () => void;
}

const btn = (active: boolean) => ({
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #1de9b6',
  background: active ? '#1de9b6' : 'transparent',
  color: active ? '#0c0f14' : '#e6f8ff',
  fontWeight: 700,
  cursor: 'pointer',
  textShadow: active ? 'none' : '0 0 6px #1de9b6',
});

const selectStyle: React.CSSProperties = {
  background: '#0c0f14',
  color: '#e6f8ff',
  border: '1px solid #1de9b6',
  borderRadius: 8,
  padding: '8px 10px',
};

const MapToolbar: React.FC<MapToolbarProps> = ({
  hasMapbox,
  provider,
  onProviderChange,
  mapboxStyle,
  onMapboxStyleChange,
  leafletStyle,
  onLeafletStyleChange,
  showRadar,
  onToggleRadar,
  onMaximize,
}) => {
  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
      <div style={{display: 'flex', gap: 6}}>
        {hasMapbox && (
          <button style={btn(provider==='mapbox')} onClick={() => onProviderChange('mapbox')}>Mapbox</button>
        )}
        <button style={btn(provider==='leaflet')} onClick={() => onProviderChange('leaflet')}>Leaflet</button>
        {hasMapbox && (
          <button style={btn(provider==='both')} onClick={() => onProviderChange('both')}>Both</button>
        )}
      </div>
      {provider !== 'leaflet' && hasMapbox && (
        <label style={{display:'inline-flex', alignItems:'center', gap:6}}>
          <span style={{color:'#1de9b6', fontWeight:700}}>Mapbox style</span>
          <select value={mapboxStyle} onChange={(e) => onMapboxStyleChange(e.target.value as any)} style={selectStyle}>
            <option value="dark">Dark</option>
            <option value="streets">Streets</option>
            <option value="satellite">Satellite</option>
          </select>
        </label>
      )}
      {provider !== 'mapbox' && (
        <label style={{display:'inline-flex', alignItems:'center', gap:6}}>
          <span style={{color:'#1de9b6', fontWeight:700}}>Leaflet style</span>
          <select value={leafletStyle} onChange={(e) => onLeafletStyleChange(e.target.value as any)} style={selectStyle}>
            <option value="dark">Dark</option>
            <option value="osm">OSM</option>
            <option value="topo">Topo</option>
          </select>
        </label>
      )}
      <button onClick={onToggleRadar} style={btn(showRadar)} title="Toggle radar overlay">
        {showRadar ? 'Radar ON' : 'Radar OFF'}
      </button>
      <button onClick={onMaximize} style={{...btn(false)}} title="Maximize map">⛶ Maximize</button>
    </div>
  );
};

export default MapToolbar;
