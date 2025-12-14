import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Map as MapIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import RoutePlannerMap from './RoutePlannerMap';

const RoutePlannerDemo: React.FC = () => {
  const [routeData, setRouteData] = useState<any>(null);
  const [waypointsData, setWaypointsData] = useState<any[]>([]);

  const handleRouteChange = (route: any) => {
    setRouteData(route);
    console.log('Route updated:', route);
  };

  const handleWaypointsChange = (waypoints: any[]) => {
    setWaypointsData(waypoints);
    console.log('Waypoints updated:', waypoints);
  };

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1de9b6 0%, #1976d2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MapIcon fontSize="large" />
          Enhanced Route Planner - Demo
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          🚀 Interactive map with route planning, waypoints, and travel calculations
        </Typography>
      </Paper>

      {/* Features Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>New Features in this Enhanced Map:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {[
            'Multi-waypoint routing',
            'Interactive map clicking',
            'Real-time distance calculation', 
            'Multiple travel modes',
            'Current location detection',
            'Route visualization',
            'Waypoint management'
          ].map((feature) => (
            <Chip key={feature} label={feature} size="small" color="info" variant="outlined" />
          ))}
        </Box>
      </Alert>

      {/* Instructions */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon />
            How to Use This Demo
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ '& > *': { mb: 1 } }}>
            <Typography>• <strong>Add Waypoints:</strong> Click &ldquo;Add waypoint&rdquo; button, then click anywhere on the map</Typography>
            <Typography>• <strong>Remove Waypoints:</strong> Use the delete button next to each waypoint in the list</Typography>
            <Typography>• <strong>Change Travel Mode:</strong> Select driving, walking, or cycling for different route calculations</Typography>
            <Typography>• <strong>Current Location:</strong> Click the location icon to add your current position</Typography>
            <Typography>• <strong>View Route:</strong> Routes are automatically calculated and displayed with distance/duration</Typography>
            <Typography>• <strong>Toggle Route:</strong> Use the &ldquo;Show route&rdquo; switch to hide/show the route line</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Route Summary */}
      {routeData && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            🗺️ Current Route Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`Distance: ${formatDistance(routeData.distance)}`} 
              sx={{ bgcolor: 'success.dark', color: 'white' }}
            />
            <Chip 
              label={`Duration: ${formatDuration(routeData.duration)}`} 
              sx={{ bgcolor: 'success.dark', color: 'white' }}
            />
            <Chip 
              label={`Waypoints: ${waypointsData.length}`} 
              sx={{ bgcolor: 'success.dark', color: 'white' }}
            />
          </Box>
        </Paper>
      )}

      {/* Main Map Component */}
      <Paper sx={{ p: 2, minHeight: 600 }}>
        <RoutePlannerMap
          height={600}
          onRouteChange={handleRouteChange}
          onWaypointsChange={handleWaypointsChange}
        />
      </Paper>

      {/* Development Info */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.100' }}>
        <Typography variant="h6" gutterBottom>
          🛠️ Development Notes
        </Typography>
        <Typography variant="body2" paragraph>
          This component is built in the <code>/src/upgrades/enhanced-maps/</code> folder and is completely separate from the main app.
          It can be safely tested and developed without affecting the existing functionality.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Dependencies added:</strong> Uses existing react-map-gl and Mapbox GL JS from your current setup.
        </Typography>
        <Typography variant="body2">
          <strong>API Requirements:</strong> Requires REACT_APP_MAPBOX_TOKEN for full functionality. Falls back to informational display if not available.
        </Typography>
      </Paper>
    </Container>
  );
};

export default RoutePlannerDemo;