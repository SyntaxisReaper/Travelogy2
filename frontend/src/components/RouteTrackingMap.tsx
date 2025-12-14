import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { MyLocation, ZoomIn, ZoomOut, Layers } from '@mui/icons-material';
import { travelColors } from '../styles/travelTheme';

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface RouteTrackingMapProps {
  currentLocation: { lat: number; lng: number } | null;
  routePath: RoutePoint[];
  isTracking: boolean;
  height?: string | number;
}

const RouteTrackingMap: React.FC<RouteTrackingMapProps> = ({
  currentLocation,
  routePath,
  isTracking,
  height = 400
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapboxAvailable, setMapboxAvailable] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');

  // Check if Mapbox is available
  useEffect(() => {
    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
    setMapboxAvailable(!!mapboxToken && mapboxToken.startsWith('pk.'));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        if (mapboxAvailable) {
          // Try to use Mapbox
          const mapboxgl = await import('mapbox-gl');
          mapboxgl.default.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

          const mapboxMap = new mapboxgl.default.Map({
            container: mapRef.current!,
            style: getMapboxStyle(mapStyle),
            center: currentLocation ? [currentLocation.lng, currentLocation.lat] : [0, 0],
            zoom: currentLocation ? 15 : 2,
            attributionControl: false
          });

          // Add navigation controls
          mapboxMap.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

          setMap(mapboxMap);
        } else {
          // Fallback to Leaflet
          const L = await import('leaflet');
          
          const leafletMap = L.map(mapRef.current!, {
            center: currentLocation ? [currentLocation.lat, currentLocation.lng] : [51.505, -0.09],
            zoom: currentLocation ? 15 : 2,
            zoomControl: true
          });

          // Add tile layer
          const tileUrl = mapStyle === 'satellite' 
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : mapStyle === 'terrain'
            ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

          L.tileLayer(tileUrl, {
            attribution: mapStyle === 'satellite' ? '© Esri' : mapStyle === 'terrain' ? '© OpenTopoMap' : '© OpenStreetMap'
          }).addTo(leafletMap);

          setMap(leafletMap);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    return () => {
      if (map) {
        if (mapboxAvailable && map.remove) {
          map.remove();
        } else if (!mapboxAvailable && map.remove) {
          map.remove();
        }
      }
    };
  }, [mapboxAvailable, mapStyle]);

  // Update map with route and current location
  useEffect(() => {
    if (!map || !currentLocation) return;

    const updateMapContent = async () => {
      try {
        if (mapboxAvailable) {
          // Mapbox implementation
          // Center on current location
          map.flyTo({
            center: [currentLocation.lng, currentLocation.lat],
            zoom: 16,
            essential: true
          });

          // Clear existing markers
          const existingMarkers = document.querySelectorAll('[id$="-marker"]');
          existingMarkers.forEach(marker => marker.remove());
          
          // Add current location marker
          const currentEl = document.createElement('div');
          currentEl.id = 'current-marker';
          currentEl.innerHTML = '📍';
          currentEl.style.fontSize = '24px';
          currentEl.style.cursor = 'pointer';
          currentEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

          const mapboxgl = await import('mapbox-gl');
          new mapboxgl.default.Marker(currentEl)
            .setLngLat([currentLocation.lng, currentLocation.lat])
            .setPopup(new mapboxgl.default.Popup().setHTML(`📍 <strong>Current Location</strong><br/>Lat: ${currentLocation.lat.toFixed(6)}<br/>Lng: ${currentLocation.lng.toFixed(6)}<br/>Time: ${new Date().toLocaleTimeString()}`))
            .addTo(map);

          // Add route line
          if (routePath.length > 1) {
            const routeCoordinates = routePath.map(point => [point.lng, point.lat]);

            const routeData = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
              }
            };

            if (map.getSource('route')) {
              map.getSource('route').setData(routeData);
            } else {
              map.addSource('route', {
                type: 'geojson',
                data: routeData
              });

              map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': travelColors.primary.ocean,
                  'line-width': 4,
                  'line-opacity': 0.8
                }
              });
            }

            // Add start marker (FROM point)
            if (routePath.length > 0) {
              const startEl = document.createElement('div');
              startEl.id = 'start-marker';
              startEl.innerHTML = '🏁';
              startEl.style.fontSize = '28px';
              startEl.style.cursor = 'pointer';
              startEl.style.backgroundColor = 'white';
              startEl.style.borderRadius = '50%';
              startEl.style.padding = '4px';
              startEl.style.border = '2px solid #4CAF50';
              startEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';

              const startTime = new Date(routePath[0].timestamp).toLocaleTimeString();
              new mapboxgl.default.Marker(startEl)
                .setLngLat([routePath[0].lng, routePath[0].lat])
                .setPopup(new mapboxgl.default.Popup().setHTML(`🏁 <strong>START POINT</strong><br/>Lat: ${routePath[0].lat.toFixed(6)}<br/>Lng: ${routePath[0].lng.toFixed(6)}<br/>Started: ${startTime}`))
                .addTo(map);
            }

            // Add end marker (TO point) if we have multiple points
            if (routePath.length > 1) {
              const endPoint = routePath[routePath.length - 1];
              const endEl = document.createElement('div');
              endEl.id = 'end-marker';
              endEl.innerHTML = '🏁';
              endEl.style.fontSize = '28px';
              endEl.style.cursor = 'pointer';
              endEl.style.backgroundColor = 'white';
              endEl.style.borderRadius = '50%';
              endEl.style.padding = '4px';
              endEl.style.border = '2px solid #f44336';
              endEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';

              const endTime = new Date(endPoint.timestamp).toLocaleTimeString();
              new mapboxgl.default.Marker(endEl)
                .setLngLat([endPoint.lng, endPoint.lat])
                .setPopup(new mapboxgl.default.Popup().setHTML(`🏁 <strong>END POINT</strong><br/>Lat: ${endPoint.lat.toFixed(6)}<br/>Lng: ${endPoint.lng.toFixed(6)}<br/>Time: ${endTime}`))
                .addTo(map);
            }
          }
        } else {
          // Leaflet implementation
          const L = await import('leaflet');
          
          // Center on current location
          map.setView([currentLocation.lat, currentLocation.lng], 16);

          // Clear existing markers and polylines
          map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
              map.removeLayer(layer);
            }
          });

          // Add current location marker (moving pin)
          const currentIcon = L.divIcon({
            html: '<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            className: 'custom-marker'
          });

          L.marker([currentLocation.lat, currentLocation.lng], { icon: currentIcon })
            .addTo(map)
            .bindPopup(`📍 Current Location<br/>Lat: ${currentLocation.lat.toFixed(6)}<br/>Lng: ${currentLocation.lng.toFixed(6)}<br/>Time: ${new Date().toLocaleTimeString()}`);

          // Add route polyline
          if (routePath.length > 1) {
            const routeCoordinates = routePath.map(point => [point.lat, point.lng] as [number, number]);
            L.polyline(routeCoordinates, {
              color: travelColors.primary.ocean,
              weight: 4,
              opacity: 0.8,
              smoothFactor: 1
            }).addTo(map);

            // Add start marker (FROM point)
            if (routePath.length > 0) {
              const startIcon = L.divIcon({
                html: '<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); background: white; border-radius: 50%; padding: 2px; border: 2px solid #4CAF50;">🏁</div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                className: 'custom-marker start-marker'
              });

              const startTime = new Date(routePath[0].timestamp).toLocaleTimeString();
              L.marker([routePath[0].lat, routePath[0].lng], { icon: startIcon })
                .addTo(map)
                .bindPopup(`🏁 <strong>START POINT</strong><br/>Lat: ${routePath[0].lat.toFixed(6)}<br/>Lng: ${routePath[0].lng.toFixed(6)}<br/>Started: ${startTime}`);
            }

            // Add end marker (TO point) if route has multiple points
            if (routePath.length > 1) {
              const endPoint = routePath[routePath.length - 1];
              const endIcon = L.divIcon({
                html: '<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); background: white; border-radius: 50%; padding: 2px; border: 2px solid #f44336;">🏁</div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                className: 'custom-marker end-marker'
              });

              const endTime = new Date(endPoint.timestamp).toLocaleTimeString();
              L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
                .addTo(map)
                .bindPopup(`🏁 <strong>END POINT</strong><br/>Lat: ${endPoint.lat.toFixed(6)}<br/>Lng: ${endPoint.lng.toFixed(6)}<br/>Time: ${endTime}`);
            }
          }
        }
      } catch (error) {
        console.error('Failed to update map content:', error);
      }
    };

    updateMapContent();
  }, [map, currentLocation, routePath, mapboxAvailable]);

  const getMapboxStyle = (style: string) => {
    switch (style) {
      case 'satellite': return 'mapbox://styles/mapbox/satellite-v9';
      case 'terrain': return 'mapbox://styles/mapbox/outdoors-v11';
      default: return 'mapbox://styles/mapbox/streets-v11';
    }
  };

  const centerOnLocation = () => {
    if (map && currentLocation) {
      if (mapboxAvailable) {
        map.flyTo({
          center: [currentLocation.lng, currentLocation.lat],
          zoom: 16,
          essential: true
        });
      } else {
        map.setView([currentLocation.lat, currentLocation.lng], 16);
      }
    }
  };

  const zoomIn = () => {
    if (map) {
      if (mapboxAvailable) {
        map.zoomIn();
      } else {
        map.zoomIn();
      }
    }
  };

  const zoomOut = () => {
    if (map) {
      if (mapboxAvailable) {
        map.zoomOut();
      } else {
        map.zoomOut();
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', height, borderRadius: 2, overflow: 'hidden', border: `2px solid ${travelColors.primary.ocean}30` }}>
      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px'
        }}
      />

      {/* Map Controls */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000
      }}>
        <Button
          size="small"
          variant="contained"
          onClick={centerOnLocation}
          disabled={!currentLocation}
          sx={{
            minWidth: 'auto',
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: travelColors.primary.ocean,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          <MyLocation fontSize="small" />
        </Button>
        
        <Button
          size="small"
          variant="contained"
          onClick={zoomIn}
          sx={{
            minWidth: 'auto',
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: travelColors.primary.ocean,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          <ZoomIn fontSize="small" />
        </Button>
        
        <Button
          size="small"
          variant="contained"
          onClick={zoomOut}
          sx={{
            minWidth: 'auto',
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: travelColors.primary.ocean,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          <ZoomOut fontSize="small" />
        </Button>
      </Box>

      {/* Map Style Selector */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000
      }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            const styles = ['streets', 'satellite', 'terrain'];
            const currentIndex = styles.indexOf(mapStyle);
            const nextIndex = (currentIndex + 1) % styles.length;
            setMapStyle(styles[nextIndex] as any);
          }}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: travelColors.primary.ocean,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          <Layers fontSize="small" />
        </Button>
      </Box>

      {/* Map Info */}
      <Box sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000
      }}>
        {!currentLocation && !isTracking && (
          <Alert severity="info" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            📍 Start GPS tracking to see your route on the map
          </Alert>
        )}
        
        {routePath.length > 1 && (
          <Box sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: travelColors.primary.ocean, fontWeight: 600 }}>
                🗺️ {mapboxAvailable ? 'Mapbox' : 'Leaflet'} • {mapStyle} • {routePath.length} points
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                🏁 FROM: {routePath[0].lat.toFixed(4)}, {routePath[0].lng.toFixed(4)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>
                🏁 TO: {routePath[routePath.length - 1].lat.toFixed(4)}, {routePath[routePath.length - 1].lng.toFixed(4)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RouteTrackingMap;