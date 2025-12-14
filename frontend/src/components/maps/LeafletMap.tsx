import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface LeafletMapProps {
  latitude?: number;
  longitude?: number;
  label?: string;
  weather?: { description?: string; tempC?: number; city?: string; country?: string } | null;
  dark?: boolean;
  showRadar?: boolean;
  tileName?: 'dark' | 'osm' | 'topo';
  rainPoints?: Array<{ lat: number; lon: number; name?: string }>;
}

const OWM_API_KEY = process.env.REACT_APP_OWM_API_KEY;

const TILE_LAYERS = {
  // Use CARTO Dark Matter (no API key required) for dark tiles
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const radarUrl = OWM_API_KEY
  ? `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`
  : '';

const markerIcon = new L.DivIcon({
  className: 'leaflet-marker-div',
  html: '<div style="font-size:24px">📍</div>',
  iconAnchor: [12, 24],
});

const MapFlyTo: React.FC<{ center?: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, Math.max(map.getZoom(), 10), { animate: true, duration: 1.2 });
  }, [center]);
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ latitude, longitude, label, weather, dark = true, showRadar, tileName, rainPoints }) => {
  const hasTarget = typeof latitude === 'number' && typeof longitude === 'number';
  const center = hasTarget ? [latitude as number, longitude as number] : [20, 0];
  const tileUrl = tileName ? TILE_LAYERS[tileName] : (dark ? TILE_LAYERS.dark : TILE_LAYERS.osm);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <MapContainer center={center as any} zoom={hasTarget ? 10 : 2} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer url={tileUrl} attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
        {showRadar && !!OWM_API_KEY && (
          <TileLayer url={radarUrl} opacity={0.7} attribution='Radar data © OpenWeatherMap' />
        )}
        {hasTarget && (
          <Marker position={center as any} icon={markerIcon as any}>
            <Popup>
              <div style={{ minWidth: 140 }}>
                <div style={{ fontWeight: 700, color: '#1de9b6' }}>{label || weather?.city || 'Location'}</div>
                {weather?.description && <div style={{ fontSize: 12, opacity: 0.8 }}>{weather.description}</div>}
                {typeof weather?.tempC === 'number' && <div style={{ fontSize: 16, fontWeight: 700 }}>{weather.tempC.toFixed(1)}°C</div>}
              </div>
            </Popup>
          </Marker>
        )}
        {/* Rain markers */}
        {Array.isArray(rainPoints) && rainPoints.map((p, i) => (
          <Marker key={`rain-${i}`} position={[p.lat as any, p.lon as any] as any} icon={new L.DivIcon({ className: 'leaflet-rain', html: '<div style="font-size:16px">💧</div>' }) as any}>
            <Popup>{p.name || 'Rain'}</Popup>
          </Marker>
        ))}
        <MapFlyTo center={hasTarget ? (center as any) : undefined} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
