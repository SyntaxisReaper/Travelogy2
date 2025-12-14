import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Typography, Box, Stack, Alert, Chip, TextField, ImageList, ImageListItem, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { PlayArrow, Stop, PhotoCamera, Save, Explore } from '@mui/icons-material';
import FlipButton from '../components/ui/FlipButton';
import { MapContainer, TileLayer, Polyline, Circle, useMap, Marker, Popup } from 'react-leaflet';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import AdventureButton from '../components/AdventureButton';
import TravelText from '../components/TravelText';
import WeatherCard from '../components/maps/WeatherCard';
import { useNotify } from '../contexts/NotifyContext';
import type { LatLngExpression } from 'leaflet';
import { tripsAPI } from '../services/api';
import { uploadTripPhotos } from '../services/storage';
import { storage } from '../services/firebase';
import { fetchNearbyPlaces, NearbyPlace } from '../services/nearby';
import L from 'leaflet';

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // meters
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TripsPage: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);
  const [follow, setFollow] = useState(true);
  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const lastNearbyRef = useRef<{ lat: number; lon: number } | null>(null);
  const lastNearbyAtRef = useRef<number>(0);
  
  const notify = useNotify();

  // Diary state
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [savingDiary, setSavingDiary] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);

  const lastPointRef = useRef<[number, number] | null>(null);

  const totalDistanceKm = useMemo(() => (distanceMeters / 1000), [distanceMeters]);
const durationMin = useMemo(() => (startTime ? (Date.now() - startTime) / 60000 : 0), [startTime]);

const emojiFor = (subtype?: string) => {
  switch (subtype) {
    case 'hospital': return '🏥';
    case 'clinic': return '🏥';
    case 'pharmacy': return '💊';
    case 'police': return '👮';
    case 'fire_station': return '🚒';
    case 'fuel': return '⛽';
    case 'atm': return '🏧';
    case 'bank': return '🏦';
    case 'cafe': return '☕';
    case 'restaurant': return '🍽️';
    case 'fast_food': return '🍔';
    case 'supermarket': return '🛒';
    case 'convenience': return '🛍️';
    default: return '📍';
  }
};

  const handleStart = useCallback(async () => {
    setError(null);
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Get an initial fix for accurate origin and UI center
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cur: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setCurrentPos({ lat: cur[0], lon: cur[1], accuracy: pos.coords.accuracy });
          setInitialCenter(cur);
          lastPointRef.current = cur;
          resolve();
        },
        (err) => {
          console.warn('Initial geolocation failed', err);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
      );
    });

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const cur: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCurrentPos({ lat: cur[0], lon: cur[1], accuracy: pos.coords.accuracy });
        setInitialCenter((prev) => prev || cur);
        setPath((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const inc = haversine(last[0], last[1], cur[0], cur[1]);
            setDistanceMeters((d) => d + inc);
          }
          lastPointRef.current = cur;
          return [...prev, cur];
        });

        // Fetch nearby services when moved >150m or every 60s
        const now = Date.now();
        const last = lastNearbyRef.current;
        const moved = last ? haversine(last.lat, last.lon, cur[0], cur[1]) : Infinity;
        if (moved > 150 || now - lastNearbyAtRef.current > 60000) {
          try {
            const res = await fetchNearbyPlaces(cur[0], cur[1], 900);
            setNearby(res);
            lastNearbyRef.current = { lat: cur[0], lon: cur[1] };
            lastNearbyAtRef.current = now;
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.debug('nearby fetch error', e);
            }
          }
        }
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );

    setWatchId(id);
    setIsTracking(true);
    setStartTime(Date.now());

    try {
      // Create active trip in backend with initial origin if we have it
      const res = await tripsAPI.startTrip({
        start_time: new Date().toISOString(),
        lat: lastPointRef.current?.[0],
        lon: lastPointRef.current?.[1],
      });
      const newId = (res?.id || res?.trip_id || res?.uuid)?.toString?.() || null;
      if (newId) setActiveTripId(newId);
    } catch (e) {
      console.warn('startTrip failed, tracking locally.');
    }
  }, []);

  const handleStop = useCallback(async () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsTracking(false);

    try {
      if (activeTripId) {
        await tripsAPI.completeTrip(activeTripId, {
          end_time: new Date().toISOString(),
          distance_km: +(totalDistanceKm.toFixed(3)),
          path: path.map(([lat, lon]) => ({ lat, lon })),
        });
      }
    } catch (e) {
      console.warn('completeTrip failed');
    }
  }, [watchId, activeTripId, path, totalDistanceKm]);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [watchId, previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const nextFiles = Array.from(list);
    setFiles(nextFiles);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    setCaptions(new Array(nextFiles.length).fill(''));
  };

  const handleSaveDiary = async () => {
    if (!note && files.length === 0) return;
    setSavingDiary(true);
    try {
      let tripId = activeTripId;
      if (!tripId) {
        // Create a trip on the fly to attach the diary
        try {
          const res = await tripsAPI.startTrip({
            start_time: new Date().toISOString(),
            lat: lastPointRef.current?.[0] ?? currentPos?.lat,
            lon: lastPointRef.current?.[1] ?? currentPos?.lon,
            meta: { created_for_diary: true }
          });
          tripId = (res?.id || res?.trip_id || res?.uuid)?.toString?.() || undefined;
          if (tripId) setActiveTripId(tripId);
        } catch (e) {
          console.warn('Failed to create trip for diary, trying direct diary endpoint');
        }
      }

      if (!tripId) {
        // If we still don't have a trip, try the diary endpoint that can create implicitly
        await tripsAPI.addDiary('new', note, files, captions);
      } else {
        if (storage && files.length > 0) {
          const urls = await uploadTripPhotos(tripId, files);
          const photos = urls.map((u, i) => ({ url: u, caption: captions[i] }));
          await tripsAPI.addDiaryUrls(tripId, note, photos);
        } else {
          await tripsAPI.addDiary(tripId, note, files, captions);
        }
      }

      notify('Diary saved');
      setNote('');
      setFiles([]);
      setCaptions([]);
      previews.forEach((u) => URL.revokeObjectURL(u));
      setPreviews([]);
    } catch (e) {
      console.error('Failed to save diary entry', e);
      notify('Failed to save diary');
    } finally {
      setSavingDiary(false);
    }
  };

  const center: LatLngExpression = initialCenter || [20, 0];

  const FollowMap: React.FC<{ center: [number, number] | null; enabled: boolean }> = ({ center, enabled }) => {
    const map = useMap();
    React.useEffect(() => {
      if (enabled && center) {
        map.setView(center as any, map.getZoom(), { animate: true });
      }
    }, [center, enabled]);
    return null;
  };


  // My trips list
  const [trips, setTrips] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await tripsAPI.getTrips();
        const list = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setTrips(list);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.ocean}08 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          right: '6%',
          width: '220px',
          height: '220px',
          background: `radial-gradient(circle, ${travelColors.primary.sunset}12 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '12%',
          left: '4%',
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, ${travelColors.primary.forest}10 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <Explore sx={{ fontSize: 40, color: travelColors.primary.ocean, mr: 2 }} />
            <TravelText
              text="Adventure Tracker"
              textVariant="adventure"
              animated
              variant="h3"
            />
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: `${travelColors.primary.coral}15`,
                border: `1px solid ${travelColors.primary.coral}40`,
                color: travelColors.primary.coral,
              }}
            >
              {error}
            </Alert>
          )}

              <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
                <Box sx={{ p: 3 }}>
                  <TravelText
                    text="Trip Controls"
                    textVariant="gradient"
                    variant="h6"
                    sx={{ mb: 3 }}
                  />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                {!isTracking ? (
                  <AdventureButton 
                    buttonVariant="ocean" 
                    startIcon={<PlayArrow />}
                    onClick={handleStart}
                    adventure
                  >
                    Start Adventure
                  </AdventureButton>
                ) : (
                  <AdventureButton 
                    buttonVariant="coral" 
                    startIcon={<Stop />}
                    onClick={handleStop}
                    adventure
                  >
                    Stop & Save Trip
                  </AdventureButton>
                )}
                <Chip 
                  label={`Distance: ${totalDistanceKm.toFixed(2)} km`} 
                  sx={{ 
                    backgroundColor: `${travelColors.primary.sunset}20`,
                    color: travelColors.primary.sunset,
                    fontWeight: 'bold'
                  }}
                />
                <Chip 
                  label={`Duration: ${durationMin.toFixed(1)} min`} 
                  sx={{ 
                    backgroundColor: `${travelColors.primary.forest}20`,
                    color: travelColors.primary.forest,
                    fontWeight: 'bold'
                  }}
                />
                {activeTripId && (
                  <Chip 
                    label={`Trip ID: ${activeTripId}`} 
                    variant="outlined" 
                    sx={{ 
                      borderColor: travelColors.primary.ocean,
                      color: travelColors.primary.ocean
                    }}
                  />
                )}
                <AdventureButton 
                  size="small" 
                  buttonVariant={follow ? 'forest' : 'sunset'}
                  onClick={() => setFollow((f) => !f)}
                >
                  {follow ? 'Following' : 'Follow me'}
                </AdventureButton>
                {currentPos && (
                  <>
                    <Chip 
                      label={`${currentPos.lat.toFixed(6)}, ${currentPos.lon.toFixed(6)} ±${Math.round(currentPos.accuracy || 0)}m`} 
                      sx={{ 
                        backgroundColor: `${travelColors.primary.sky}20`,
                        color: travelColors.text.primary,
                        fontSize: '0.75rem'
                      }}
                    />
                    <AdventureButton 
                      size="small" 
                      buttonVariant="ocean"
                      onClick={() => {
                        const txt = `${currentPos.lat.toFixed(6)}, ${currentPos.lon.toFixed(6)}`;
                        navigator.clipboard?.writeText(txt).then(() => notify('Coordinates copied')); 
                      }}
                    >
                      Copy Coords
                    </AdventureButton>
                  </>
                )}
              </Stack>
            </Box>
          </TravelCard>

          <TravelCard cardVariant="default" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Destination Weather"
                textVariant="wanderlust"
                variant="h6"
                sx={{ mb: 2 }}
              />
              <WeatherCard height={200} />
            </Box>
          </TravelCard>
          
          <TravelCard cardVariant="forest" cardElevation="high" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ 
              height: 500, 
              overflow: 'hidden',
              borderRadius: '12px'
            }}>
        <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FollowMap center={currentPos ? [currentPos.lat, currentPos.lon] : initialCenter} enabled={follow} />
          {path.length > 0 && (
            <>
              <Polyline positions={path as LatLngExpression[]} color={travelColors.primary.ocean} weight={4} />
            </>
          )}
          {currentPos && (
            <>
              <Circle center={[currentPos.lat, currentPos.lon] as LatLngExpression} radius={Math.max(10, Math.min(200, currentPos.accuracy || 50))} pathOptions={{ color: travelColors.primary.sky, opacity: 0.3 }} />
              <Circle center={[currentPos.lat, currentPos.lon] as LatLngExpression} radius={5} pathOptions={{ color: travelColors.primary.coral }} />
            </>
          )}
          {/* Nearby services markers */}
          {nearby.map((p) => {
            const icon = new L.DivIcon({ className: 'nearby-ico', html: `<div style="font-size:16px">${emojiFor(p.subtype)}</div>` });
            return (
              <Marker key={p.id} position={[p.lat, p.lon] as any} icon={icon as any}>
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontWeight: 700 }}>{p.name || (p.subtype || 'Place')}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{p.type}/{p.subtype}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
              </MapContainer>
            </Box>
          </TravelCard>

          {/* Gemini Trip Insights */}
          <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="AI Trip Insights"
                textVariant="adventure"
                variant="h6"
                sx={{ mb: 2 }}
              />
              <AdventureButton 
                size="small" 
                buttonVariant="sunset"
                onClick={async () => {
                  const { analyticsAPI } = await import('../services/api');
                  const durationMin = startTime ? (Date.now() - startTime) / 60000 : 0;
                  try {
                    const res = await analyticsAPI.askGeminiTrip({ distance_km: +(totalDistanceKm.toFixed(2)), duration_min: +(durationMin.toFixed(1)) });
                    notify(res?.insights || 'Gemini did not return insights');
                  } catch {
                    notify('Gemini insights unavailable right now');
                  }
                }}
              >
                Ask Gemini about my trip
              </AdventureButton>
            </Box>
          </TravelCard>

          <TravelCard cardVariant="paper" cardElevation="medium" sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Export & Share"
                textVariant="gradient"
                variant="h6"
                sx={{ mb: 2 }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <AdventureButton 
                  size="small" 
                  buttonVariant="forest"
                  onClick={() => {
                    if (path.length < 2) return;
                    const fc = {
                      type: 'FeatureCollection',
                      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: path.map((p) => [p[1], p[0]]) }, properties: { activeTripId } }]
                    } as any;
                    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `active-trip.geojson`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export GeoJSON
                </AdventureButton>
                <AdventureButton 
                  size="small" 
                  buttonVariant="ocean"
                  onClick={() => {
                    if (path.length < 2) return;
                    const header = `<?xml version="1.0" encoding="UTF-8"?>\n`;
                    const open = `<gpx version="1.1" creator="Travelogy"><trk><name>Active Trip</name><trkseg>`;
                    const seg = path.map((p) => `<trkpt lat="${p[0]}" lon="${p[1]}"></trkpt>`).join('');
                    const close = `</trkseg></trk></gpx>`;
                    const gpx = header + open + seg + close;
                    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `active-trip.gpx`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export GPX
                </AdventureButton>
                <AdventureButton 
                  size="small" 
                  buttonVariant="coral"
                  onClick={async () => {
                    if (!navigator.share) {
                      alert('Sharing is not supported on this device.');
                      return;
                    }
                    const distanceKm = (distanceMeters / 1000).toFixed(2);
                    const shareUrl = window.location.href;
                    try {
                      await navigator.share({
                        title: 'My Trip',
                        text: `I just tracked a trip of ${distanceKm} km with Travelogy!`,
                        url: shareUrl,
                      });
                    } catch (e) {
                      if (process.env.NODE_ENV !== 'production') {
                        // eslint-disable-next-line no-console
                        console.debug('share cancelled or failed', e);
                      }
                    }
                  }}
                >
                  Share Trip
                </AdventureButton>
              </Stack>
            </Box>
          </TravelCard>

          {/* My Trips */}
          <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <TravelText
                  text="My Adventures"
                  textVariant="wanderlust"
                  variant="h6"
                />
                <AdventureButton 
                  size="small" 
                  buttonVariant="ocean"
                  onClick={() => window.location.assign('/trips/list')}
                >
                  View All
                </AdventureButton>
              </Stack>
              {!trips.length && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: travelColors.text.secondary,
                    textAlign: 'center',
                    py: 3,
                    fontStyle: 'italic'
                  }}
                >
                  No trips yet. Start tracking to record your first adventure!
                </Typography>
              )}
              <Stack spacing={2}>
                {trips.map((t) => (
                  <Stack key={t.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Typography 
                      variant="body2"
                      sx={{ color: travelColors.text.primary }}
                    >
                      {new Date(t.start_time).toLocaleString()} • {t.transport_mode} • {Math.round(t.distance_km || 0)} km
                    </Typography>
                    <AdventureButton 
                      size="small" 
                      buttonVariant="sunset"
                      onClick={() => window.location.assign(`/trips/${t.id}`)}
                    >
                      Open
                    </AdventureButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </TravelCard>

          {/* Trip Diary */}
          <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="Trip Diary"
                textVariant="adventure"
                variant="h6"
                sx={{ mb: 3 }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                <AdventureButton 
                  buttonVariant="forest"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Add Photos
                  <input hidden accept="image/*" type="file" multiple onChange={handleFileChange} />
                </AdventureButton>
                <TextField
                  label="What did you feel during your journey?"
                  placeholder="Write your experience..."
                  multiline
                  minRows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: travelColors.primary.sunset,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: travelColors.primary.sunset,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: travelColors.primary.sunset,
                    },
                  }}
                />
                <AdventureButton 
                  buttonVariant="sunset"
                  startIcon={<Save />}
                  onClick={handleSaveDiary} 
                  disabled={savingDiary || (!note && files.length === 0)}
                  adventure
                >
                  {savingDiary ? 'Saving…' : 'Save Diary'}
                </AdventureButton>
              </Stack>
              {previews.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <ImageList cols={Math.min(4, previews.length)} rowHeight={160}>
                    {previews.map((src, i) => (
                      <ImageListItem key={i}>
                        <img 
                          src={src} 
                          alt={`preview-${i}`} 
                          style={{ 
                            objectFit: 'cover', 
                            width: '100%', 
                            height: '120px',
                            borderRadius: '8px'
                          }} 
                        />
                        <TextField
                          placeholder="Caption"
                          size="small"
                          value={captions[i] || ''}
                          onChange={(e) => setCaptions((c) => {
                            const copy = [...c];
                            copy[i] = e.target.value;
                            return copy;
                          })}
                          fullWidth
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            },
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Box>
          </TravelCard>
          <TravelCard cardVariant="paper" cardElevation="medium" sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <TravelText
                text="My Adventures"
                textVariant="wanderlust"
                variant="h6"
                sx={{ mb: 2 }}
              />
              {!trips.length && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: travelColors.text.secondary,
                    textAlign: 'center',
                    py: 3,
                    fontStyle: 'italic'
                  }}
                >
                  No trips yet. Start tracking to record your first adventure!
                </Typography>
              )}
              <Stack spacing={2}>
                {trips.map((t) => (
                  <Stack key={t.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Typography 
                      variant="body2"
                      sx={{ color: travelColors.text.primary }}
                    >
                      {new Date(t.start_time).toLocaleString()} • {t.transport_mode} • {Math.round(t.distance_km || 0)} km
                    </Typography>
                    <AdventureButton 
                      size="small" 
                      buttonVariant="sunset"
                      onClick={() => window.location.assign(`/trips/${t.id}`)}
                    >
                      Open
                    </AdventureButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </TravelCard>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TripsPage;
