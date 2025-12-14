import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Chip, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MyLocation as MyLocationIcon,
  Route as RouteIcon,
  Timeline as TimelineIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Types
interface Waypoint {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  address?: string;
}

interface RouteData {
  geometry: any;
  distance: number; // in meters
  duration: number; // in seconds
}

export interface RoutePlannerMapProps {
  height?: string | number;
  onRouteChange?: (route: RouteData | null) => void;
  onWaypointsChange?: (waypoints: Waypoint[]) => void;
  initialWaypoints?: Waypoint[];
}

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Sample waypoints for demo
const DEMO_WAYPOINTS: Waypoint[] = [
  { id: '1', name: 'Start Point', coordinates: [-74.006, 40.7128], address: 'New York, NY' },
  { id: '2', name: 'Stop 1', coordinates: [-74.0059, 40.7589], address: 'Central Park, NY' },
];

const RoutePlannerMap: React.FC<RoutePlannerMapProps> = ({
  height = 500,
  onRouteChange,
  onWaypointsChange,
  initialWaypoints = DEMO_WAYPOINTS
}) => {
  // State
  const [waypoints, setWaypoints] = useState<Waypoint[]>(initialWaypoints);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [newWaypointName, setNewWaypointName] = useState('');
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  const [viewState, setViewState] = useState({
    longitude: initialWaypoints[0]?.coordinates[0] || -74.006,
    latitude: initialWaypoints[0]?.coordinates[1] || 40.7128,
    zoom: 12
  });

  // Calculate route using Mapbox Directions API
  const calculateRoute = useCallback(async () => {
    if (waypoints.length < 2 || !MAPBOX_TOKEN) return;

    try {
      const coordinates = waypoints.map(wp => wp.coordinates.join(',')).join(';');
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const routeData: RouteData = {
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration
        };
        
        setRoute(routeData);
        onRouteChange?.(routeData);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [waypoints, travelMode, onRouteChange]);

  // Add waypoint by clicking on map
  const handleMapClick = useCallback((event: any) => {
    if (!isAddingWaypoint) return;
    
    const [lng, lat] = event.lngLat.toArray();
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      name: newWaypointName || `Waypoint ${waypoints.length + 1}`,
      coordinates: [lng, lat]
    };
    
    const updatedWaypoints = [...waypoints, newWaypoint];
    setWaypoints(updatedWaypoints);
    onWaypointsChange?.(updatedWaypoints);
    setNewWaypointName('');
    setIsAddingWaypoint(false);
  }, [isAddingWaypoint, newWaypointName, waypoints, onWaypointsChange]);

  // Remove waypoint
  const removeWaypoint = useCallback((id: string) => {
    const updatedWaypoints = waypoints.filter(wp => wp.id !== id);
    setWaypoints(updatedWaypoints);
    onWaypointsChange?.(updatedWaypoints);
  }, [waypoints, onWaypointsChange]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition((position) => {
      const newWaypoint: Waypoint = {
        id: Date.now().toString(),
        name: 'Current Location',
        coordinates: [position.coords.longitude, position.coords.latitude]
      };
      
      const updatedWaypoints = [...waypoints, newWaypoint];
      setWaypoints(updatedWaypoints);
      onWaypointsChange?.(updatedWaypoints);
      
      setViewState(prev => ({
        ...prev,
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        zoom: 14
      }));
    });
  }, [waypoints, onWaypointsChange]);

  // Calculate route when waypoints change
  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  // Format distance and duration
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Fallback when no Mapbox token
  if (!MAPBOX_TOKEN) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Enhanced Maps Require Mapbox Token
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add REACT_APP_MAPBOX_TOKEN to your environment variables to enable route planning.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          This component would provide:
        </Typography>
        <Box sx={{ mt: 1 }}>
          {['Interactive route planning', 'Waypoint management', 'Distance calculations', 'Multiple travel modes'].map((feature) => (
            <Chip key={feature} label={feature} size="small" sx={{ m: 0.5 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {/* Control Panel */}
      <Paper sx={{ p: 2, minWidth: 300, maxWidth: { xs: '100%', md: 350 } }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouteIcon />
          Route Planner
        </Typography>
        
        {/* Travel Mode */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Travel Mode</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['driving', 'walking', 'cycling'] as const).map((mode) => (
              <Button
                key={mode}
                size="small"
                variant={travelMode === mode ? 'contained' : 'outlined'}
                onClick={() => setTravelMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Route Info */}
        {route && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" gutterBottom>Route Summary</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                icon={<NavigationIcon />}
                label={formatDistance(route.distance)} 
                size="small" 
                color="primary" 
              />
              <Chip 
                icon={<TimelineIcon />}
                label={formatDuration(route.duration)} 
                size="small" 
                color="secondary" 
              />
            </Box>
          </Paper>
        )}

        {/* Add Waypoint */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Add Waypoint</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="Waypoint name"
              value={newWaypointName}
              onChange={(e) => setNewWaypointName(e.target.value)}
              disabled={isAddingWaypoint}
            />
            <Tooltip title="Get current location">
              <IconButton size="small" onClick={getCurrentLocation}>
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            variant={isAddingWaypoint ? 'contained' : 'outlined'}
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingWaypoint(!isAddingWaypoint)}
            fullWidth
          >
            {isAddingWaypoint ? 'Click map to add' : 'Add waypoint'}
          </Button>
        </Box>

        {/* Waypoints List */}
        <Typography variant="subtitle2" gutterBottom>Waypoints ({waypoints.length})</Typography>
        <List dense>
          {waypoints.map((waypoint, index) => (
            <ListItem key={waypoint.id}>
              <ListItemText
                primary={`${index + 1}. ${waypoint.name}`}
                secondary={waypoint.address || `${waypoint.coordinates[1].toFixed(4)}, ${waypoint.coordinates[0].toFixed(4)}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => removeWaypoint(waypoint.id)}
                  disabled={waypoints.length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* Show Route Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={showRoute}
              onChange={(e) => setShowRoute(e.target.checked)}
              size="small"
            />
          }
          label="Show route"
        />
      </Paper>

      {/* Map */}
      <Box sx={{ flexGrow: 1, height, minHeight: 400 }}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v10"
          style={{ width: '100%', height: '100%' }}
          cursor={isAddingWaypoint ? 'crosshair' : 'default'}
        >
          {/* Waypoint Markers */}
          {waypoints.map((waypoint, index) => (
            <Marker
              key={waypoint.id}
              longitude={waypoint.coordinates[0]}
              latitude={waypoint.coordinates[1]}
              onClick={() => setSelectedWaypoint(waypoint.id)}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: index === 0 ? 'success.main' : index === waypoints.length - 1 ? 'error.main' : 'warning.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 12,
                  cursor: 'pointer',
                  border: selectedWaypoint === waypoint.id ? '3px solid #fff' : '2px solid rgba(255,255,255,0.8)'
                }}
              >
                {index + 1}
              </Box>
            </Marker>
          ))}

          {/* Route Line */}
          {route && showRoute && (
            <Source type="geojson" data={route.geometry}>
              <Layer
                id="route"
                type="line"
                paint={{
                  'line-color': '#1de9b6',
                  'line-width': 4,
                  'line-opacity': 0.8
                }}
              />
            </Source>
          )}

          <NavigationControl position="top-right" />
        </Map>
      </Box>
    </Box>
  );
};

export default RoutePlannerMap;