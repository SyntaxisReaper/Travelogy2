import React, { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LeafletMap from './LeafletMap';

export interface GlobeMapProps {
  latitude?: number;
  longitude?: number;
  label?: string;
  weather?: { description?: string; tempC?: number; city?: string; country?: string } | null;
  dark?: boolean;
  showRadar?: boolean;
  styleName?: 'dark' | 'streets' | 'satellite';
  rainPoints?: Array<{ lat: number; lon: number; name?: string }>;
}

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const OWM_API_KEY = process.env.REACT_APP_OWM_API_KEY;

const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v10',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v11',
};

const RADAR_SOURCE_ID = 'owm-radar';
const RADAR_LAYER_ID = 'owm-radar-layer';

const GlobeMap: React.FC<GlobeMapProps> = ({ latitude, longitude, label, weather, dark = true, showRadar, styleName, rainPoints }) => {
  const [internalStyle, setInternalStyle] = useState(dark ? MAP_STYLES.dark : MAP_STYLES.streets);
  const style = styleName
    ? (styleName === 'dark' ? MAP_STYLES.dark : styleName === 'streets' ? MAP_STYLES.streets : MAP_STYLES.satellite)
    : internalStyle;
  const mapRef = useRef<any>(null);
  const [popupOpen, setPopupOpen] = useState(true);

  const hasTarget = typeof latitude === 'number' && typeof longitude === 'number';

  // Animate zoom from globe -> target
  useEffect(() => {
    const m = mapRef.current?.getMap?.();
    if (!m) return;
    if (hasTarget) {
      // zoom out first
      m.flyTo({ center: [longitude as number, latitude as number], zoom: 2, speed: 1.6, curve: 1.3, essential: true });
      const id = setTimeout(() => {
        m.flyTo({ center: [longitude as number, latitude as number], zoom: 10, speed: 1.2, curve: 1.42, essential: true });
      }, 700);
      return () => clearTimeout(id);
    }
  }, [latitude, longitude, hasTarget]);

  const isGlobe = true;
  const mapKey = style + '-globe';

  // Terrain + sky for globe
  useEffect(() => {
    const m = mapRef.current?.getMap?.();
    if (!m) return;
    const onLoad = () => {
      if (!m.getSource('mapbox-dem')) {
        m.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.terrain-rgb', tileSize: 512, maxzoom: 14 });
        m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      }
      if (!m.getLayer('sky')) {
        m.addLayer({ id: 'sky', type: 'sky', paint: { 'sky-type': 'atmosphere', 'sky-atmosphere-sun-intensity': 15 } });
      }
    };
    if (m.isStyleLoaded()) onLoad(); else m.once('styledata', onLoad);
  }, [style]);

  // Radar overlay
  useEffect(() => {
    const m = mapRef.current?.getMap?.();
    if (!m || !m.isStyleLoaded()) return;

    if (!showRadar) {
      if (m.getLayer(RADAR_LAYER_ID)) m.removeLayer(RADAR_LAYER_ID);
      if (m.getSource(RADAR_SOURCE_ID)) m.removeSource(RADAR_SOURCE_ID);
      return;
    }
    if (!OWM_API_KEY) return;
    if (!m.getSource(RADAR_SOURCE_ID)) {
      m.addSource(RADAR_SOURCE_ID, {
        type: 'raster',
        tiles: [
          `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`
        ],
        tileSize: 256,
        attribution: 'Radar data © OpenWeatherMap'
      });
    }
    if (!m.getLayer(RADAR_LAYER_ID)) {
      m.addLayer({ id: RADAR_LAYER_ID, type: 'raster', source: RADAR_SOURCE_ID, paint: { 'raster-opacity': 0.7 } });
    }
  }, [showRadar]);

  // Better error handling and fallback
  if (!MAPBOX_TOKEN || !MAPBOX_TOKEN.startsWith('pk.')) {
    console.warn('🗺️ Mapbox token not configured or invalid, falling back to Leaflet maps');
    console.warn('To enable Mapbox: Set REACT_APP_MAPBOX_TOKEN in environment variables');
    
    // Fallback to Leaflet with a fly-to animation to emulate globe zoom
    return (
      <LeafletMap
        latitude={latitude}
        longitude={longitude}
        label={label}
        weather={weather as any}
        dark={dark}
        showRadar={showRadar}
        tileName={'dark'}
        rainPoints={rainPoints as any}
      />
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Map
        key={mapKey}
        ref={mapRef}
        mapLib={mapboxgl}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 1.6 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={style}
        mapboxAccessToken={MAPBOX_TOKEN}
        projection={{ name: 'globe' } as any}
      >
        {hasTarget && (
          <Marker longitude={longitude as number} latitude={latitude as number} anchor="bottom" onClick={() => setPopupOpen(true)}>
            <div style={{ fontSize: 24, cursor: 'pointer' }}>📍</div>
          </Marker>
        )}
        {popupOpen && hasTarget && (
          <Popup longitude={longitude as number} latitude={latitude as number} anchor="bottom" onClose={() => setPopupOpen(false)} closeOnClick={false}>
            <div style={{ minWidth: 140 }}>
              <div style={{ fontWeight: 700, color: '#1de9b6' }}>{label || weather?.city || 'Location'}</div>
              {weather?.description && <div style={{ fontSize: 12, opacity: 0.8 }}>{weather.description}</div>}
              {typeof weather?.tempC === 'number' && <div style={{ fontSize: 16, fontWeight: 700 }}>{weather.tempC.toFixed(1)}°C</div>}
            </div>
          </Popup>
        )}
        {/* Rain markers */}
        {Array.isArray(rainPoints) && rainPoints.map((p, i) => (
          <Marker key={`rain-${i}`} longitude={p.lon} latitude={p.lat} anchor="bottom">
            <div title={p.name || 'Rain'} style={{ fontSize: 16 }}>💧</div>
          </Marker>
        ))}
        <NavigationControl position="top-left" showCompass />
      </Map>
    </div>
  );
};

export default GlobeMap;