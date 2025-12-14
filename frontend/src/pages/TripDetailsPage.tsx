import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Stack, Chip, Button, TextField } from '@mui/material';
import { uploadTripPhotos } from '../services/storage';
import { storage } from '../services/firebase';
import { useNotify } from '../contexts/NotifyContext';
import { MapContainer, TileLayer, Polyline, Circle } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { tripsAPI } from '../services/api';

interface DiaryEntry { id?: string; note?: string; photos?: string[]; created_at?: string }

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const notify = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const t = await tripsAPI.getTripById(id);
        setTrip(t);
      } catch (e) {
        setError('Failed to load trip');
      }
    };
    load();
  }, [id]);

  const center: LatLngExpression = useMemo(() => {
    const p = trip?.path || trip?.route || [];
    if (Array.isArray(p) && p.length) {
      const first = p[0];
      if (Array.isArray(first)) return [first[0], first[1]] as LatLngExpression;
      if (first?.lat && first?.lon) return [first.lat, first.lon] as LatLngExpression;
    }
    return [20, 0];
  }, [trip]);

  const positions: LatLngExpression[] = useMemo(() => {
    const p = trip?.path || trip?.route || [];
    if (!Array.isArray(p)) return [];
    return p.map((pt: any) => (Array.isArray(pt) ? (pt as LatLngExpression) : ([pt.lat, pt.lon] as LatLngExpression)));
  }, [trip]);

  const diaries: DiaryEntry[] = trip?.diaries || trip?.diary_entries || [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // New entry state
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newCaptions, setNewCaptions] = useState<string[]>([]);
  const [savingNew, setSavingNew] = useState(false);

  const beginEdit = (d: DiaryEntry) => {
    setEditingId(d.id || '');
    setEditingText(d.note || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async () => {
    if (!editingId || !trip?.id) return;
    try {
      await tripsAPI.updateDiary(trip.id, editingId, { note: editingText });
      // refresh
      const t = await tripsAPI.getTripById(trip.id);
      setTrip(t);
      cancelEdit();
      notify('Diary updated');
    } catch (e) {
      console.error('Failed to update diary');
      notify('Failed to update diary');
    }
  };

  const deleteEntry = async (entryId?: string) => {
    if (!entryId || !trip?.id) return;
    if (!confirm('Delete this diary entry?')) return;
    try {
      await tripsAPI.deleteDiary(trip.id, entryId);
      const t = await tripsAPI.getTripById(trip.id);
      setTrip(t);
      notify('Diary deleted');
    } catch (e) {
      console.error('Failed to delete diary');
      notify('Failed to delete diary');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">🗺️ Trip Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/trips')}>Back to Trips</Button>
      </Stack>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Paper sx={{ height: 400, overflow: 'hidden', mb: 2 }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {positions.length > 0 && (
            <>
              <Polyline positions={positions} color="#00e5ff" weight={4} />
              <Circle center={positions[positions.length - 1]} radius={10} pathOptions={{ color: '#ff4081' }} />
            </>
          )}
        </MapContainer>
      </Paper>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => {
          if (!positions.length) return;
          const fc = {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: positions.map((p: any) => Array.isArray(p) ? [p[1], p[0]] : [p.lng, p.lat]) }, properties: { id } }]
          } as any;
          const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trip-${id}.geojson`;
          a.click();
          URL.revokeObjectURL(url);
        }}>Export GeoJSON</Button>
        <Button size="small" variant="outlined" onClick={() => {
          if (!positions.length) return;
          const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Travelogy"><trk><name>Trip ${id}</name><trkseg>`+
            positions.map((p: any) => {
              const lat = Array.isArray(p) ? p[0] : p.lat;
              const lon = Array.isArray(p) ? p[1] : p.lon;
              return `<trkpt lat="${lat}" lon="${lon}"></trkpt>`;
            }).join('')+
            `</trkseg></trk></gpx>`;
          const blob = new Blob([gpx], { type: 'application/gpx+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trip-${id}.gpx`;
          a.click();
          URL.revokeObjectURL(url);
        }}>Export GPX</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Add New Diary Entry</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <TextField label="Note" value={editingText} onChange={(e) => setEditingText(e.target.value)} fullWidth multiline minRows={3} placeholder="Write about your trip..." />
          <Button variant="outlined" component="label">Attach Photos<input type="file" hidden multiple accept="image/*" onChange={(e) => {
            const list = e.target.files; if (!list) return; const files = Array.from(list);
            setNewFiles(files);
            setNewPreviews(files.map(f => URL.createObjectURL(f)));
            setNewCaptions(new Array(files.length).fill(''));
          }} /></Button>
          {newPreviews.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {newPreviews.map((src, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="img" src={src} alt={`preview-${i}`} sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 1 }} />
                  <TextField size="small" label="Caption" value={newCaptions[i] || ''} onChange={(e) => setNewCaptions(prev => { const next=[...prev]; next[i]=e.target.value; return next; })} fullWidth />
                </Box>
              ))}
            </Box>
          )}
          <Box>
            <Button variant="contained" disabled={savingNew} onClick={async () => {
              if (!trip?.id) return;
              setSavingNew(true);
              try {
                if (storage && newFiles.length > 0) {
                  const urls = await uploadTripPhotos(trip.id, newFiles);
                  const photos = urls.map((u, i) => ({ url: u, caption: newCaptions[i] }));
                  await tripsAPI.addDiaryUrls(trip.id, editingText, photos as any);
                } else {
                  await tripsAPI.addDiary(trip.id, editingText, newFiles, newCaptions);
                }
                const t = await tripsAPI.getTripById(trip.id);
                setTrip(t);
                setEditingText('');
                newPreviews.forEach(u => URL.revokeObjectURL(u));
                setNewFiles([]); setNewPreviews([]); setNewCaptions([]);
                notify('Diary entry added');
              } catch {
                notify('Failed to add diary entry');
              } finally {
                setSavingNew(false);
              }
            }}>Save Entry</Button>
          </Box>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Diary Entries</Typography>
        {!diaries?.length && (
          <Typography variant="body2" color="text.secondary">No diary entries for this trip.</Typography>
        )}
        <Stack spacing={2}>
          {diaries?.map((d, idx) => (
            <Box key={d.id || idx}>
              {d.created_at && <Chip label={new Date(d.created_at).toLocaleString()} sx={{ mb: 1 }} />}
              {editingId === d.id ? (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
                  <TextField value={editingText} onChange={(e) => setEditingText(e.target.value)} fullWidth multiline minRows={2} />
                  <Button size="small" variant="contained" onClick={saveEdit}>Save</Button>
                  <Button size="small" onClick={cancelEdit}>Cancel</Button>
                </Box>
              ) : (
                d.note && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {d.note}
                  </Typography>
                )
              )}
              {Array.isArray(d.photos) && d.photos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {d.photos.map((p: any, i: number) => {
                    const url = typeof p === 'string' ? p : p.url;
                    const caption = typeof p === 'string' ? '' : p.caption;
                    return (
                      <Box key={i}>
                        <Box component="img" src={url} alt={`photo-${i}`} sx={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                        {caption && <Typography variant="caption" sx={{ display: 'block' }}>{caption}</Typography>}
                      </Box>
                    );
                  })}
                </Box>
              )}
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => beginEdit(d)}>Edit</Button>
                <Button size="small" color="error" onClick={() => deleteEntry(d.id)}>Delete</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default TripDetailsPage;
