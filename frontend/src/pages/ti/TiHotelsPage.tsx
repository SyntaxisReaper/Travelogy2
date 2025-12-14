import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Alert, TextField, Grid, Chip, Divider } from '@mui/material';
import { Hotel as HotelIcon, ShowChart } from '@mui/icons-material';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import AdventureButton from '../../components/AdventureButton';
import { tourismAPI } from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type District = { id: number; name: string };

const TiHotelsPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string>('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [hotelId, setHotelId] = useState<string>('');
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [util, setUtil] = useState<any>(null);

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
        const res = await tourismAPI.listHotels({ district_id: districtId || undefined, q: q || undefined });
        const list = Array.isArray(res) ? res : (res?.results || []);
        setItems(list);
        // reset selection if it no longer exists
        if (hotelId && !list.some((h: any) => String(h.id) === String(hotelId))) {
          setHotelId('');
          setSnapshots([]);
        }
      } catch {
        setError('Failed to load hotels');
      }
    };
    load();
  }, [districtId, q, hotelId]);

  useEffect(() => {
    const loadUtil = async () => {
      try {
        const res = await tourismAPI.getHotelUtilization({ district_id: districtId || undefined });
        setUtil(res);
      } catch {
        // ignore
      }
    };
    loadUtil();
  }, [districtId]);

  useEffect(() => {
    const loadSnaps = async () => {
      if (!hotelId) {
        setSnapshots([]);
        return;
      }
      try {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        const res = await tourismAPI.getHotelSnapshots({
          hotel_id: hotelId,
          start: start.toISOString(),
          end: end.toISOString(),
        });
        setSnapshots(Array.isArray(res) ? res : []);
      } catch {
        setSnapshots([]);
      }
    };
    loadSnaps();
  }, [hotelId]);

  const districtSummary = util?.districts?.[0];

  const chartData = useMemo(() => {
    return snapshots.map((s) => ({
      t: new Date(s.ts).toLocaleString(),
      occ: s.occupancy_ratio != null ? Math.round(s.occupancy_ratio * 100) : null,
    }));
  }, [snapshots]);

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.forest}08 100%)`, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <HotelIcon sx={{ fontSize: 36, color: travelColors.primary.forest, mr: 1 }} />
          <TravelText text="Hotels" textVariant="adventure" animated variant="h3" />
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
            <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 260, flex: 1 }} />
            <AdventureButton buttonVariant="sunset" onClick={() => window.location.assign('/ti/admin/ingest')}>
              Upload CSV
            </AdventureButton>
          </Box>
        </TravelCard>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Utilization summary" textVariant="gradient" variant="h6" sx={{ mb: 2 }} />
                {districtSummary ? (
                  <>
                    <Typography sx={{ fontWeight: 800 }}>{districtSummary.district}</Typography>
                    <Typography sx={{ color: travelColors.text.secondary, mb: 1 }}>
                      Hotels: {districtSummary.hotels} · Rooms: {districtSummary.rooms_total_sum}
                    </Typography>
                    <Chip
                      label={`Occupancy avg: ${districtSummary.occupancy_avg != null ? Math.round(districtSummary.occupancy_avg * 100) + '%' : '—'}`}
                      sx={{ backgroundColor: `${travelColors.primary.forest}15`, color: travelColors.primary.forest, fontWeight: 'bold' }}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      Tip: select a hotel to view occupancy trend from snapshots.
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ color: travelColors.text.secondary }}>
                    No snapshot data yet. Upload hotel snapshot CSV in `/ti/admin/ingest`.
                  </Typography>
                )}

                <TextField
                  select
                  label="Hotel (trend)"
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                  SelectProps={{ native: true }}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  <option value="">Select a hotel</option>
                  {items.map((h) => (
                    <option key={h.id} value={String(h.id)}>{h.name}</option>
                  ))}
                </TextField>
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={7}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ShowChart sx={{ color: travelColors.primary.ocean }} />
                  <TravelText text="Occupancy trend (last 7 days)" textVariant="ocean" variant="h6" />
                </Box>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.ocean}15`} />
                      <XAxis dataKey="t" hide />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="occ" stroke={travelColors.primary.ocean} fill={`${travelColors.primary.sky}40`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
                {hotelId && chartData.length === 0 && (
                  <Typography sx={{ mt: 2, color: travelColors.text.secondary }}>
                    No snapshots for this hotel yet.
                  </Typography>
                )}
                {!hotelId && (
                  <Typography sx={{ mt: 2, color: travelColors.text.secondary }}>
                    Select a hotel on the left to view trend.
                  </Typography>
                )}
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12}>
            <TravelText text="Hotel registry" textVariant="adventure" variant="h5" sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              {items.map((h) => (
                <Grid item xs={12} md={6} key={h.id}>
                  <TravelCard cardVariant="default" cardElevation="medium" borderAccent>
                    <Box sx={{ p: 2 }}>
                      <Typography sx={{ fontWeight: 800 }}>{h.name}</Typography>
                      <Typography sx={{ color: travelColors.text.secondary, mb: 1 }}>{h.district?.name || '—'}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {h.rating != null && <Chip label={`⭐ ${h.rating}`} size="small" />}
                        {h.rooms_total != null && <Chip label={`Rooms: ${h.rooms_total}`} size="small" />}
                        {h.category && <Chip label={h.category} size="small" />}
                      </Box>
                    </Box>
                  </TravelCard>
                </Grid>
              ))}
              {items.length === 0 && (
                <Grid item xs={12}>
                  <Typography sx={{ textAlign: 'center', color: travelColors.text.secondary }}>
                    No hotels yet. Upload a registry CSV in /ti/admin/ingest.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TiHotelsPage;
