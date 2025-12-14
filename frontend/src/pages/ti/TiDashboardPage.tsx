import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Grid, Typography, Alert, Chip, TextField, Divider } from '@mui/material';
import { Analytics, FlightTakeoff, Hotel as HotelIcon } from '@mui/icons-material';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import { tourismAPI } from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type District = { id: number; name: string };

const TiDashboardPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string>('');
  const [entryPoints, setEntryPoints] = useState<any[]>([]);
  const [entryPointId, setEntryPointId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [live, setLive] = useState<any[]>([]);
  const [arrivalsSeries, setArrivalsSeries] = useState<any[]>([]);
  const [hotelUtil, setHotelUtil] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const meta = await tourismAPI.getMeta();
        setDistricts(meta.districts || []);
        const eps = await tourismAPI.listEntryPoints();
        setEntryPoints(Array.isArray(eps) ? eps : (eps?.results || []));
      } catch {
        setError('Failed to load Tourism Intelligence metadata');
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadEntryPoints = async () => {
      try {
        const eps = await tourismAPI.listEntryPoints({ district_id: districtId || undefined });
        setEntryPoints(Array.isArray(eps) ? eps : (eps?.results || []));
      } catch {
        // ignore
      }
    };
    loadEntryPoints();
    setEntryPointId('');
  }, [districtId]);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await tourismAPI.getFootfallLive({ minutes: 60, district_id: districtId || undefined });
        setLive(Array.isArray(res) ? res : []);
      } catch {
        setError('Failed to load live footfall');
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [districtId]);

  useEffect(() => {
    const loadArrivals = async () => {
      try {
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        const res = await tourismAPI.getEntryTimeseries({
          district_id: districtId || undefined,
          entry_point_id: entryPointId || undefined,
          start: start.toISOString(),
          end: end.toISOString(),
        });
        setArrivalsSeries(Array.isArray(res) ? res : []);
      } catch {
        // keep quiet; dashboard still usable
      }
    };
    loadArrivals();
  }, [districtId, entryPointId]);

  useEffect(() => {
    const loadHotelUtil = async () => {
      try {
        const res = await tourismAPI.getHotelUtilization();
        setHotelUtil(res);
      } catch {
        // ignore
      }
    };
    loadHotelUtil();
  }, []);

  const top = useMemo(() => {
    const by = new Map<string, { total: number; status?: string }>();
    for (const r of live) {
      const key = `${r.attraction_name || r.attraction_id}`;
      const prev = by.get(key) || { total: 0, status: r.crowd_status };
      by.set(key, { total: prev.total + (r.unique_visitors || 0), status: r.crowd_status || prev.status });
    }
    return Array.from(by.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
  }, [live]);

  const arrivalsChart = useMemo(() => {
    return arrivalsSeries.map((p) => ({
      t: new Date(p.bucket_start).toLocaleTimeString(),
      domestic: p.domestic || 0,
      international: p.international || 0,
      total: (p.domestic || 0) + (p.international || 0) + (p.unknown || 0),
    }));
  }, [arrivalsSeries]);

  const utilDistricts = hotelUtil?.districts || [];
  const topOcc = utilDistricts.filter((d: any) => d.occupancy_avg != null).slice(0, 5);
  const selectedDistrictUtil = districtId ? utilDistricts.find((d: any) => String(d.district_id) === String(districtId)) : null;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.forest}08 100%)`,
      py: 4,
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Analytics sx={{ fontSize: 36, color: travelColors.primary.forest, mr: 1 }} />
          <TravelText text="Rajasthan Tourism Dashboard" textVariant="adventure" animated variant="h3" />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Filters" textVariant="gradient" variant="h6" sx={{ mb: 2 }} />
                <TextField
                  select
                  fullWidth
                  label="District"
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ mb: 2 }}
                >
                  <option value="">All districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Entry point (arrivals)"
                  value={entryPointId}
                  onChange={(e) => setEntryPointId(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">All entry points</option>
                  {entryPoints.map((ep) => (
                    <option key={ep.id} value={String(ep.id)}>{ep.name}</option>
                  ))}
                </TextField>

                <Typography sx={{ mt: 2, color: travelColors.text.secondary }}>
                  Live view refreshes every ~15s. Buckets are 5 minutes.
                </Typography>
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={8}>
            <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Top crowded (last 60 mins)" textVariant="wanderlust" variant="h6" sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {top.length === 0 && (
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      No live data yet. Ingest via `/api/tourism/ingest/footfall/`.
                    </Typography>
                  )}
                  {top.map(([name, info]) => (
                    <Chip
                      key={name}
                      label={`${name}: ${info.total} (${info.status || '—'})`}
                      sx={{
                        backgroundColor:
                          info.status === 'critical'
                            ? `${travelColors.accents.error}20`
                            : info.status === 'warn'
                            ? `${travelColors.accents.warning}20`
                            : `${travelColors.primary.ocean}20`,
                        color:
                          info.status === 'critical'
                            ? travelColors.accents.error
                            : info.status === 'warn'
                            ? travelColors.accents.warning
                            : travelColors.primary.ocean,
                        fontWeight: 'bold',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={7}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FlightTakeoff sx={{ color: travelColors.primary.forest }} />
                  <TravelText text="Arrivals into Rajasthan (last 24h)" textVariant="forest" variant="h6" />
                </Box>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={arrivalsChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.forest}15`} />
                      <XAxis dataKey="t" hide />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="domestic" stackId="1" stroke={travelColors.primary.forest} fill={`${travelColors.primary.forest}30`} />
                      <Area type="monotone" dataKey="international" stackId="1" stroke={travelColors.primary.sunset} fill={`${travelColors.primary.sunset}30`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
                {arrivalsChart.length === 0 && (
                  <Typography sx={{ mt: 2, color: travelColors.text.secondary }}>
                    No arrivals data yet. Ingest via `/api/tourism/ingest/entry/`.
                  </Typography>
                )}
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={5}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HotelIcon sx={{ color: travelColors.primary.coral }} />
                  <TravelText text="Hotel utilization (last 7d)" textVariant="wanderlust" variant="h6" />
                </Box>

                {selectedDistrictUtil && (
                  <>
                    <Typography sx={{ fontWeight: 800 }}>{selectedDistrictUtil.district}</Typography>
                    <Typography sx={{ color: travelColors.text.secondary, mb: 1 }}>
                      Rooms: {selectedDistrictUtil.rooms_total_sum} · Hotels: {selectedDistrictUtil.hotels}
                    </Typography>
                    <Chip
                      label={`Occupancy avg: ${selectedDistrictUtil.occupancy_avg != null ? Math.round(selectedDistrictUtil.occupancy_avg * 100) + '%' : '—'}`}
                      sx={{ backgroundColor: `${travelColors.primary.coral}20`, color: travelColors.primary.coral, fontWeight: 'bold' }}
                    />
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                <Typography sx={{ fontWeight: 700, mb: 1 }}>Top occupancy districts</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {topOcc.length === 0 && (
                    <Typography sx={{ color: travelColors.text.secondary }}>No snapshot data yet.</Typography>
                  )}
                  {topOcc.map((d: any) => (
                    <Chip
                      key={d.district_id}
                      label={`${d.district}: ${Math.round((d.occupancy_avg || 0) * 100)}%`}
                      size="small"
                      sx={{ backgroundColor: `${travelColors.primary.coral}15`, color: travelColors.primary.coral, fontWeight: 'bold' }}
                    />
                  ))}
                </Box>
              </Box>
            </TravelCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TiDashboardPage;
