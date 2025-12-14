import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Alert,
  Chip,
  Paper,
  LinearProgress
} from '@mui/material';
import { 
  FlightTakeoff, 
  LocationOn, 
  Timer, 
  PhotoCamera,
  Map as MapIcon,
  TravelExplore,
  Stop,
  GpsFixed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { travelColors } from '../styles/travelTheme';
import RouteTrackingMap from '../components/RouteTrackingMap';
import TravelText from '../components/TravelText';
import TypewriterText from '../components/TypewriterText';
import LoadingSpinner from '../components/LoadingSpinner';

const SimpleTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTracking, setIsTracking] = useState(false);
  const [isInitializingGPS, setIsInitializingGPS] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [gpsSignalStrength, setGpsSignalStrength] = useState<'weak' | 'good' | 'excellent'>('good');
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);

  const trackingMessages = [
    'Ready to explore? Start your GPS adventure! 🎯',
    'Track every step of your journey 🚶‍♂️',
    'Create memories that last forever ✨',
    'Your next adventure awaits 🏔️',
    'Discover the world, one step at a time 🌍'
  ];
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [trackingData, setTrackingData] = useState({
    distance: 0,
    duration: 0,
    startTime: null as number | null,
    path: [] as {lat: number, lng: number, timestamp: number}[]
  });
  const [locationError, setLocationError] = useState<string | null>(null);

  // GPS tracking functions
  const startTracking = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsInitializingGPS(true);
    setLocationError(null);

    try {
      // Get initial position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      const startLocation = { lat: latitude, lng: longitude };
      
      setCurrentLocation(startLocation);
      setIsTracking(true);
      setIsInitializingGPS(false);
      setLocationError(null);
      setTrackingData({
        distance: 0,
        duration: 0,
        startTime: Date.now(),
        path: [{ ...startLocation, timestamp: Date.now() }]
      });

      // Start watching position
      const watchId = navigator.geolocation.watchPosition(
        (newPosition) => {
          const newLoc = {
            lat: newPosition.coords.latitude,
            lng: newPosition.coords.longitude
          };
          setCurrentLocation(newLoc);
          setLastUpdateTime(new Date());
          
          // Update accuracy and signal strength
          const accuracy = newPosition.coords.accuracy;
          setLocationAccuracy(accuracy);
          
          // Update speed and heading if available
          if (newPosition.coords.speed !== null) {
            setCurrentSpeed(newPosition.coords.speed * 3.6); // Convert m/s to km/h
          }
          if (newPosition.coords.heading !== null) {
            setCurrentHeading(newPosition.coords.heading);
          }
          
          if (accuracy < 10) {
            setGpsSignalStrength('excellent');
          } else if (accuracy < 50) {
            setGpsSignalStrength('good');
          } else {
            setGpsSignalStrength('weak');
          }
          
          // Update path and calculate distance
          setTrackingData(prev => {
            const newPath = [...prev.path, { ...newLoc, timestamp: Date.now() }];
            let totalDistance = 0;
            
            // Simple distance calculation (Haversine formula)
            for (let i = 1; i < newPath.length; i++) {
              const prevPoint = newPath[i - 1];
              const curr = newPath[i];
              const R = 6371; // Earth's radius in km
              const dLat = (curr.lat - prevPoint.lat) * Math.PI / 180;
              const dLng = (curr.lng - prevPoint.lng) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                       Math.cos(prevPoint.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
                       Math.sin(dLng/2) * Math.sin(dLng/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              totalDistance += R * c;
            }
            
            return {
              ...prev,
              path: newPath,
              distance: totalDistance,
              duration: prev.startTime ? (Date.now() - prev.startTime) / 1000 / 60 : 0
            };
          });
        },
        (error) => {
          setLocationError(`GPS Error: ${error.message}`);
          setGpsSignalStrength('weak');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );

      // Store watch ID to clear it later
      (window as any).trackingWatchId = watchId;
      
    } catch (error: any) {
      setLocationError(`Failed to get location: ${error.message}`);
      setIsInitializingGPS(false);
    }
  };

  const stopTracking = () => {
    if ((window as any).trackingWatchId) {
      navigator.geolocation.clearWatch((window as any).trackingWatchId);
      (window as any).trackingWatchId = null;
    }
    setIsTracking(false);
  };

  // Format duration as readable string
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Navigation functions
  const openRouteePlanner = () => {
    // Check if we have a map-enabled version of trips page
    navigate('/trips/list'); // Navigate to trips list for now
  };

  const viewOnMap = () => {
    if (currentLocation) {
      // Open Google Maps with current location
      const url = `https://www.google.com/maps/@${currentLocation.lat},${currentLocation.lng},15z`;
      window.open(url, '_blank');
    } else {
      setLocationError('No current location available');
    }
  };

  const mockTrips = [
    {
      id: 1,
      title: 'City Walking Tour',
      date: '2024-12-28',
      distance: '3.2 km',
      duration: '45 min',
      status: 'completed',
      photos: 8
    },
    {
      id: 2,
      title: 'Mountain Hike',
      date: '2024-12-27',
      distance: '8.7 km',
      duration: '2h 30m',
      status: 'completed',
      photos: 15
    },
    {
      id: 3,
      title: 'Beach Walk',
      date: '2024-12-26',
      distance: '2.1 km',
      duration: '25 min',
      status: 'completed',
      photos: 12
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}15 100%)`,
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <TravelText
            text="🗺️ Adventures & Trips"
            textVariant="adventure"
            animated={true}
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              mb: 3
            }}
          />
          
          <Box sx={{ mb: 4, minHeight: '60px' }}>
            <TypewriterText
              lines={trackingMessages}
              variant="h6"
              typingSpeedMs={50}
              pauseMs={3000}
              sx={{
                color: travelColors.primary.forest,
                fontWeight: 500,
                maxWidth: 700,
                mx: 'auto'
              }}
            />
          </Box>

          {/* Trip Tracking Controls */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant={isTracking ? 'contained' : 'contained'}
              size="large"
              startIcon={isTracking ? <Stop /> : <FlightTakeoff />}
              onClick={isTracking ? stopTracking : startTracking}
              sx={{
                background: isTracking ? 
                  `linear-gradient(45deg, ${travelColors.accents.error}, ${travelColors.primary.coral})` :
                  `linear-gradient(45deg, ${travelColors.primary.ocean}, ${travelColors.primary.sky})`,
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 20px ${isTracking ? travelColors.accents.error : travelColors.primary.ocean}40`,
                },
              }}
            >
              {isTracking ? 'Stop Adventure' : 'Start GPS Tracking'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<MapIcon />}
              onClick={openRouteePlanner}
              sx={{
                borderColor: travelColors.primary.sunset,
                color: travelColors.primary.sunset,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: travelColors.primary.coral,
                  backgroundColor: `${travelColors.primary.sunset}10`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              View Route Planner
            </Button>
            {currentLocation && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<GpsFixed />}
                onClick={viewOnMap}
                sx={{
                  borderColor: travelColors.primary.forest,
                  color: travelColors.primary.forest,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: travelColors.primary.forest,
                    backgroundColor: `${travelColors.primary.forest}10`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                View on Map
              </Button>
            )}
          </Box>

          {/* Error Display */}
          {locationError && (
            <Alert 
              severity="error" 
              onClose={() => setLocationError(null)}
              sx={{ 
                maxWidth: 500, 
                mx: 'auto',
                mb: 3
              }}
            >
              {locationError}
            </Alert>
          )}

          {/* GPS Initialization Loading */}
          {isInitializingGPS && (
            <Box sx={{ mb: 4 }}>
              <LoadingSpinner
                travel={true}
                compact={true}
                message="🛰️ Initializing GPS... Please allow location access"
                size={50}
              />
            </Box>
          )}

          {/* Tracking Status */}
          {isTracking && (
            <Paper 
              elevation={3}
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                p: 3,
                backgroundColor: `${travelColors.primary.ocean}05`,
                border: `2px solid ${travelColors.primary.ocean}30`,
                borderRadius: 3,
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: travelColors.primary.ocean, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: travelColors.primary.ocean, fontWeight: 600 }}>
                    🎯 Adventure in Progress!
                  </Typography>
                </Box>
                
                {/* Live GPS Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: gpsSignalStrength === 'excellent' ? '#4CAF50' : gpsSignalStrength === 'good' ? '#FF9800' : '#F44336',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    }
                  }} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: travelColors.text.secondary }}>
                    {gpsSignalStrength.toUpperCase()} GPS
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Distance</Typography>
                  <Typography variant="h6" sx={{ color: travelColors.primary.sunset, fontWeight: 600 }}>
                    {trackingData.distance.toFixed(2)} km
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="h6" sx={{ color: travelColors.primary.forest, fontWeight: 600 }}>
                    {formatDuration(trackingData.duration)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Speed</Typography>
                  <Typography variant="h6" sx={{ color: travelColors.primary.ocean, fontWeight: 600 }}>
                    {currentSpeed ? `${currentSpeed.toFixed(1)} km/h` : '- km/h'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Points</Typography>
                  <Typography variant="h6" sx={{ color: travelColors.primary.coral, fontWeight: 600 }}>
                    {trackingData.path.length}
                  </Typography>
                </Grid>
              </Grid>
              
              {currentLocation && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: `${travelColors.primary.ocean}08`, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: travelColors.text.secondary,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    mb: 1
                  }}>
                    📍 Current: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {locationAccuracy && (
                      <Typography variant="caption" sx={{ 
                        color: travelColors.text.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        🎯 Accuracy: ±{locationAccuracy.toFixed(0)}m
                      </Typography>
                    )}
                    
                    {lastUpdateTime && (
                      <Typography variant="caption" sx={{ 
                        color: travelColors.text.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        🕒 Updated: {lastUpdateTime.toLocaleTimeString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              
              <LinearProgress 
                variant="indeterminate" 
                sx={{ 
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: `${travelColors.primary.ocean}20`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: travelColors.primary.ocean
                  }
                }} 
              />
            </Paper>
          )}

          {/* Route Map - Show when tracking or has tracked data */}
          {(isTracking || trackingData.path.length > 0) && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ 
                color: travelColors.primary.ocean,
                fontFamily: '"Playfair Display", serif',
                textAlign: 'center',
                mb: 3
              }}>
                🗺️ Live Route Map
              </Typography>
              
              <RouteTrackingMap
                currentLocation={currentLocation}
                routePath={trackingData.path}
                isTracking={isTracking}
                height={400}
              />
            </Box>
          )}
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <CardContent>
                <Typography variant="h3" sx={{ color: travelColors.primary.ocean, fontWeight: 'bold' }}>
                  {mockTrips.length}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Total Adventures
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <CardContent>
                <Typography variant="h3" sx={{ color: travelColors.primary.sunset, fontWeight: 'bold' }}>
                  14.0
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Total KM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <CardContent>
                <Typography variant="h3" sx={{ color: travelColors.primary.forest, fontWeight: 'bold' }}>
                  3h 40m
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Total Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <CardContent>
                <Typography variant="h3" sx={{ color: travelColors.primary.coral, fontWeight: 'bold' }}>
                  35
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Photos Taken
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Adventures */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            color: travelColors.primary.ocean,
            fontFamily: '"Playfair Display", serif',
            mb: 3
          }}>
            Recent Adventures
          </Typography>
          
          <Grid container spacing={3}>
            {mockTrips.map((trip) => (
              <Grid item xs={12} md={6} lg={4} key={trip.id}>
                <Card sx={{ 
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${travelColors.primary.ocean}20`,
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: travelColors.text.primary }}>
                        {trip.title}
                      </Typography>
                      <Chip 
                        label={trip.status} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${travelColors.accents.success}20`,
                          color: travelColors.accents.success,
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📅 {trip.date}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" sx={{ color: travelColors.primary.ocean }} />
                        <Typography variant="body2">{trip.distance}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Timer fontSize="small" sx={{ color: travelColors.primary.sunset }} />
                        <Typography variant="body2">{trip.duration}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhotoCamera fontSize="small" sx={{ color: travelColors.primary.forest }} />
                        <Typography variant="body2">{trip.photos} photos</Typography>
                      </Box>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<TravelExplore />}
                      sx={{
                        borderColor: travelColors.primary.ocean,
                        color: travelColors.primary.ocean,
                        '&:hover': {
                          backgroundColor: `${travelColors.primary.ocean}10`,
                          borderColor: travelColors.primary.ocean,
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Coming Soon Features */}
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ color: travelColors.primary.ocean }}>
            🚀 Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Interactive maps, GPS tracking, route planning, and photo journaling features are being enhanced!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SimpleTripsPage;