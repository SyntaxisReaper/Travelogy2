import React from 'react';
import { Dialog, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlaceSearch, { PlaceSuggestion } from './PlaceSearch';
import GlobeMap from './GlobeMap';
import LeafletMap from './LeafletMap';

interface WeatherMapModalProps {
  open: boolean;
  onClose: () => void;
  useMapbox: boolean;
  showRadar: boolean;
  place: PlaceSuggestion | null;
  onSelectPlace: (p: PlaceSuggestion) => void;
  weather: { description?: string; tempC?: number; city?: string; country?: string } | null;
  mapboxStyle?: 'dark' | 'streets' | 'satellite';
  leafletStyle?: 'dark' | 'osm' | 'topo';
}

const WeatherMapModal: React.FC<WeatherMapModalProps> = ({ open, onClose, useMapbox, showRadar, place, onSelectPlace, weather, mapboxStyle, leafletStyle }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" PaperProps={{ sx: { background: '#0c0f14', border: '1px solid #1de9b6' } }}>
      <Box sx={{ position: 'relative', p: 2 }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#1de9b6' }} aria-label="Close map">
          <CloseIcon />
        </IconButton>
        <Box sx={{ mb: 2 }}>
          <PlaceSearch onSelect={onSelectPlace} placeholder="Search city, place…" />
        </Box>
        <Box sx={{ height: { xs: '60vh', md: '70vh' }, border: '1px solid #1de9b6' }}>
          {useMapbox ? (
            <GlobeMap
              latitude={place?.latitude}
              longitude={place?.longitude}
              label={place?.city || place?.name}
              weather={weather}
              dark
              showRadar={showRadar}
              styleName={mapboxStyle}
            />
          ) : (
            <LeafletMap
              latitude={place?.latitude}
              longitude={place?.longitude}
              label={place?.city || place?.name}
              weather={weather}
              dark
              showRadar={showRadar}
              tileName={leafletStyle}
            />
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default WeatherMapModal;
