import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { LocalHospital, MyLocation, Warning } from '@mui/icons-material';
import { colors } from '../styles/techTheme';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface NearbyPlace {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  phone?: string;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // meters
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface EmergencySOSProps { mode?: 'fab' | 'inline'; buttonLabel?: string }

const EmergencySOS: React.FC<EmergencySOSProps> = ({ mode = 'fab', buttonLabel = 'Medical Emergency' }) => {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);
  const [nearest, setNearest] = useState<NearbyPlace | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Set up Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const locateAndFindHospital = useCallback(async () => {
    setError(null);
    setNearest(null);
    setSent(false);
    setLoading(true);

    const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
      if (!('geolocation' in navigator)) reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
    });

    try {
      const pos = await getPosition();
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setPosition({ lat, lon, accuracy: pos.coords.accuracy });

      // Overpass API: search for hospitals/clinics within ~3km
      const query = `[out:json];(node(around:3000,${lat},${lon})[amenity~"hospital|clinic"];way(around:3000,${lat},${lon})[amenity~"hospital|clinic"];);out center;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      const candidates: NearbyPlace[] = (data.elements || []).map((el: any) => {
        const nlat = el.type === 'node' ? el.lat : el.center?.lat;
        const nlon = el.type === 'node' ? el.lon : el.center?.lon;
        const dist = nlat && nlon ? haversine(lat, lon, nlat, nlon) : Number.MAX_SAFE_INTEGER;
        const phone = el.tags?.["contact:phone"] || el.tags?.phone;
        return {
          id: el.id,
          name: el.tags?.name || 'Nearest hospital/clinic',
          lat: nlat,
          lon: nlon,
          distanceMeters: dist,
          phone,
        } as NearbyPlace;
      }).filter((p: NearbyPlace) => Number.isFinite(p.distanceMeters));

      if (!candidates.length) {
        setError('No hospitals found nearby. Please call local emergency services.');
      } else {
        const sorted = candidates.sort((a, b) => a.distanceMeters - b.distanceMeters);
        setNearest(sorted[0]);
      }
    } catch (e) {
      setError((e as Error).message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    locateAndFindHospital();
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setNearest(null);
    setSending(false);
    setSent(false);
  };

  const handleSend = async () => {
    if (!position) return;
    setSending(true);
    setError(null);
    
    try {
      const emergencyData = {
        type: 'medical_emergency',
        timestamp: serverTimestamp(),
        user_id: user?.uid || null,
        user_email: user?.email || null,
        user_name: user?.displayName || 'Anonymous',
        location: { 
          latitude: position.lat, 
          longitude: position.lon, 
          accuracy: position.accuracy || null 
        },
        nearest_hospital: nearest ? {
          name: nearest.name,
          latitude: nearest.lat,
          longitude: nearest.lon,
          distance_meters: Math.round(nearest.distanceMeters),
          phone: nearest.phone || null
        } : null,
        client: 'travelogy-frontend',
        status: 'new'
      };

      // Save emergency report to Firebase
      let firebaseReportId = null;
      try {
        const docRef = await addDoc(collection(db, 'emergency_reports'), emergencyData);
        firebaseReportId = docRef.id;
        console.log('Emergency report saved to Firebase:', firebaseReportId);
      } catch (fbError) {
        console.warn('Failed to save to Firebase:', fbError);
      }

      // Prepare emergency text
      const text = `🚨 MEDICAL EMERGENCY 🚨\n\n` +
        `📍 Location: ${position.lat.toFixed(6)}, ${position.lon.toFixed(6)}\n` +
        `🎯 Accuracy: ±${Math.round(position.accuracy || 0)} meters\n\n` +
        (nearest ? `🏥 Nearest Hospital: ${nearest.name}\n` +
                   `   Distance: ~${(nearest.distanceMeters / 1000).toFixed(2)} km\n` +
                   (nearest.phone ? `   Phone: ${nearest.phone}\n` : '') + '\n' : '') +
        (user ? `👤 User: ${user.displayName || 'Anonymous'}\n` +
               `📧 Email: ${user.email}\n` +
               `🆔 User ID: ${user.uid}\n\n` : '') +
        `🗺️ Map: https://www.openstreetmap.org/?mlat=${position.lat}&mlon=${position.lon}#map=18/${position.lat}/${position.lon}\n` +
        (firebaseReportId ? `📋 Report ID: ${firebaseReportId}\n` : '') +
        `\n⏰ Time: ${new Date().toLocaleString()}`;

      // Try to share or send via email
      let shared = false;
      if (navigator.share) {
        try {
          await navigator.share({ 
            title: '🚨 Medical Emergency Alert',
            text: text
          });
          shared = true;
        } catch (shareError) {
          console.log('Share failed, using mailto:', shareError);
        }
      }
      
      if (!shared) {
        // Fallback: open email client
        const mailto = `mailto:emergency@local-services.com,911@emergency.com?subject=${encodeURIComponent('🚨 MEDICAL EMERGENCY ALERT')}&body=${encodeURIComponent(text)}`;
        window.open(mailto, '_blank');
      }

      setSent(true);
    } catch (e) {
      console.error('Emergency send failed:', e);
      setError('Failed to send emergency report. Please call 911 or local emergency services directly.');
    } finally {
      setSending(false);
    }
  };

  const hospitalInfo = useMemo(() => {
    if (!nearest) return null;
    const km = (nearest.distanceMeters / 1000).toFixed(2);
    return `${nearest.name} • ${km} km away`;
  }, [nearest]);

  return (
    <>
      {mode === 'fab' ? (
        <Fab
          color="error"
          aria-label="medical-emergency"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: (theme) => theme.spacing(3),
            right: (theme) => theme.spacing(3),
            zIndex: 1500,
            boxShadow: `0 0 15px ${colors.glitchRed}`,
          }}
        >
          <LocalHospital />
        </Fab>
      ) : (
        <Button variant="contained" color="error" startIcon={<LocalHospital />} onClick={handleOpen}>
          {buttonLabel}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" /> Medical Emergency
        </DialogTitle>
        <DialogContent dividers>
          {loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          {!loading && !error && (
            <>
              <Typography variant="body1" sx={{ mb: 1 }}>
                We use your current location to notify the nearest hospital/clinic.
              </Typography>
              {position && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MyLocation fontSize="small" />
                  <Typography variant="body2">
                    {position.lat.toFixed(6)}, {position.lon.toFixed(6)} (±{Math.round(position.accuracy || 0)} m)
                  </Typography>
                </Box>
              )}
              {hospitalInfo && (
                <Typography variant="body2" color="text.secondary">
                  {hospitalInfo}
                </Typography>
              )}
              {nearest?.phone && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="inherit" component="a" href={`tel:${nearest.phone}`}>
                    Call hospital: {nearest.phone}
                  </Button>
                </Box>
              )}
              {sent && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Emergency report prepared. If a backend is configured, it has been notified. Otherwise, we shared a message you can send immediately.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Close</Button>
          <Button onClick={handleSend} variant="contained" color="error" disabled={loading || sending}>
            {sending ? 'Sending…' : 'Send Emergency Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmergencySOS;
