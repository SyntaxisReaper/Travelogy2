import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, TextField, Grid, Chip } from '@mui/material';
import { Sensors } from '@mui/icons-material';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import { tourismAPI } from '../../services/api';

type District = { id: number; name: string };

const TiFootfallPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string>('');
  const [minutes, setMinutes] = useState<number>(30);
  const [mode, setMode] = useState<'footfall' | 'presence'>('footfall');
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const meta = await tourismAPI.getMeta();
        setDistricts(meta.districts || []);
      } catch {
        // ignore
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        if (mode === 'presence') {
          const end = new Date();
          const start = new Date(end.getTime() - minutes * 60 * 1000);
          const res = await tourismAPI.getFootfallPresence({
            district_id: districtId || undefined,
            start: start.toISOString(),
            end: end.toISOString(),
          });
          setRows(Array.isArray(res) ? res : []);
        } else {
          const res = await tourismAPI.getFootfallLive({ minutes, district_id: districtId || undefined });
          setRows(Array.isArray(res) ? res : []);
        }
      } catch {
        setError('Failed to load live footfall');
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [districtId, minutes, mode]);

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.coral}08 100%)`, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Sensors sx={{ fontSize: 36, color: travelColors.primary.coral, mr: 1 }} />
          <TravelText text="Live Footfall" textVariant="adventure" animated variant="h3" />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TravelCard cardVariant="paper" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
          <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="District"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 240 }}
            >
              <option value="">All districts</option>
              {districts.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
            </TextField>

            <TextField
              select
              label="Metric"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 220 }}
            >
              <option value="footfall">Footfall (unique per bucket)</option>
              <option value="presence">Presence (in/out net delta)</option>
            </TextField>

            <TextField
              type="number"
              label="Window (minutes)"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(5, Math.min(360, Number(e.target.value))))}
              sx={{ width: 200 }}
            />
            <Typography sx={{ color: travelColors.text.secondary, alignSelf: 'center' }}>
              Buckets are 5 minutes.
            </Typography>
          </Box>
        </TravelCard>

        <Grid container spacing={2}>
          {rows.map((r, idx) => (
            <Grid item xs={12} md={6} key={`${r.attraction_id}-${r.bucket_start}-${idx}`}>
              <TravelCard cardVariant="default" cardElevation="medium" borderAccent>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>{r.attraction_name || `Attraction ${r.attraction_id}`}</Typography>
                  <Typography sx={{ color: travelColors.text.secondary, mb: 1 }}>{r.district || '—'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`Bucket: ${new Date(r.bucket_start).toLocaleTimeString()}`} size="small" />

                    {mode === 'presence' ? (
                      <>
                        <Chip label={`In: ${r.in_unique ?? 0}`} size="small" />
                        <Chip label={`Out: ${r.out_unique ?? 0}`} size="small" />
                        <Chip label={`Net: ${r.net ?? 0}`} size="small" />
                        <Chip
                          label={`Δ since start: ${r.cumulative_net ?? 0}`}
                          size="small"
                          sx={{ backgroundColor: `${travelColors.primary.coral}20`, color: travelColors.primary.coral, fontWeight: 'bold' }}
                        />
                      </>
                    ) : (
                      <Chip
                        label={`Unique: ${r.unique_visitors}`}
                        size="small"
                        sx={{ backgroundColor: `${travelColors.primary.coral}20`, color: travelColors.primary.coral, fontWeight: 'bold' }}
                      />
                    )}

                    {r.crowd_status && (
                      <Chip
                        size="small"
                        label={`Status: ${r.crowd_status}`}
                        sx={{
                          backgroundColor:
                            r.crowd_status === 'critical'
                              ? `${travelColors.accents.error}20`
                              : r.crowd_status === 'warn'
                              ? `${travelColors.accents.warning}20`
                              : `${travelColors.accents.success}20`,
                          color:
                            r.crowd_status === 'critical'
                              ? travelColors.accents.error
                              : r.crowd_status === 'warn'
                              ? travelColors.accents.warning
                              : travelColors.accents.success,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </TravelCard>
            </Grid>
          ))}
          {rows.length === 0 && (
            <Grid item xs={12}>
              <Typography sx={{ textAlign: 'center', color: travelColors.text.secondary }}>
                No live events yet. Ingest via `/api/tourism/ingest/footfall/` (use direction=in/out for presence mode).
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default TiFootfallPage;
