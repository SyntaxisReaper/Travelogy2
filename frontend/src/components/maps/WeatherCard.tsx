import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import PlaceSearch, { PlaceSuggestion } from './PlaceSearch';
import GlobeMap from './GlobeMap';
import LeafletMap from './LeafletMap';
import { fetchWeather, WeatherData } from '../../services/weather';

interface WeatherCardProps {
  height?: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ height = 320 }) => {
  const [place, setPlace] = useState<PlaceSuggestion | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const hasMapbox = !!process.env.REACT_APP_MAPBOX_TOKEN;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!place) return;
      const w = await fetchWeather(place.latitude, place.longitude);
      if (!cancelled) setWeather(w);
    };
    run();
    return () => { cancelled = true; };
  }, [place]);

  const label = useMemo(() => {
    if (place?.city) return `${place.city}${place.country ? ', ' + place.country : ''}`;
    return place?.name;
  }, [place]);

  return (
    <Paper sx={{ p: 2, background: '#0c0f14', border: '1px solid #1de9b6' }}>
      <Typography variant="h6" sx={{ color: '#e6f8ff', mb: 1 }}>🌦️ Quick Weather</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <PlaceSearch onSelect={setPlace} placeholder="Search city, place…" />
        </Box>
        {weather && (
          <Box sx={{ color: '#e6f8ff' }}>
            <Typography variant="body1" sx={{ color: '#1de9b6' }}>{label}</Typography>
            <Typography variant="body2">{weather.description}</Typography>
            {typeof weather.tempC === 'number' && (
              <Typography variant="h6" fontWeight={700}>{weather.tempC.toFixed(1)}°C</Typography>
            )}
          </Box>
        )}
      </Box>
      <Box sx={{ height: { xs: Math.min(280, height), md: height } }}>
        <LeafletMap latitude={place?.latitude} longitude={place?.longitude} label={label} weather={weather} dark showRadar={!!process.env.REACT_APP_OWM_API_KEY} />
      </Box>
    </Paper>
  );
};

export default WeatherCard;
