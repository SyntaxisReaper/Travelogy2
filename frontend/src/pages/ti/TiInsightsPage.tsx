import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Alert, Grid, TextField, Chip } from '@mui/material';
import { Insights } from '@mui/icons-material';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import { tourismAPI } from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type District = { id: number; name: string };

const weekdayLabel = (d: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d] ?? String(d);

const TiInsightsPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);

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
        const [o, g] = await Promise.all([
          tourismAPI.getInsightsOverview({ district_id: districtId || undefined, days: 14, live_minutes: 60 }),
          tourismAPI.getInsightsGaps({ days: 14 }),
        ]);
        setOverview(o);
        setGaps(g);
      } catch {
        setError('Failed to load insights');
      }
    };
    load();
  }, [districtId]);

  const topCrowded = overview?.top_crowded || [];
  const peakHours = useMemo(() => (overview?.peak_hours || []).map((r: any) => ({ ...r, hour: String(r.hour) })), [overview]);
  const peakWeekdays = useMemo(() => (overview?.peak_weekdays || []).map((r: any) => ({ ...r, weekday: weekdayLabel(r.weekday) })), [overview]);
  const dailyTotals = useMemo(() => (overview?.daily_totals || []).map((r: any) => ({ ...r, date: String(r.date).slice(5) })), [overview]);
  const peakDays = overview?.peak_days || [];
  const under = overview?.under_utilized || [];
  const gapDistricts = gaps?.districts || [];

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.forest}08 100%)`, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Insights sx={{ fontSize: 36, color: travelColors.primary.sky, mr: 1 }} />
          <TravelText text="Insights" textVariant="adventure" animated variant="h3" />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TravelCard cardVariant="paper" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
          <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="District (optional)"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 260 }}
            >
              <option value="">All districts</option>
              {districts.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
            </TextField>
            <Typography sx={{ color: travelColors.text.secondary, alignSelf: 'center' }}>
              Insights use the last 14 days of data and a 60-minute live window.
            </Typography>
          </Box>
        </TravelCard>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Peak hours" textVariant="wanderlust" variant="h6" sx={{ mb: 2 }} />
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.ocean}20`} />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill={travelColors.primary.ocean} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Peak weekdays" textVariant="adventure" variant="h6" sx={{ mb: 2 }} />
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakWeekdays}>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.sunset}20`} />
                      <XAxis dataKey="weekday" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill={travelColors.primary.sunset} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Top crowded now" textVariant="gradient" variant="h6" sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {topCrowded.length === 0 && (
                    <Typography sx={{ color: travelColors.text.secondary }}>No data yet.</Typography>
                  )}
                  {topCrowded.map((r: any) => (
                    <Chip
                      key={r.attraction_id}
                      label={`${r.attraction_name} (${r.district}) · ${r.live_unique_visitors} · ${r.crowd_status}`}
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
                  ))}
                </Box>
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Daily totals (last 14 days)" textVariant="ocean" variant="h6" sx={{ mb: 2 }} />
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTotals}>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.ocean}15`} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill={travelColors.primary.sky} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                {peakDays.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {peakDays.slice(0, 5).map((d: any) => (
                      <Chip
                        key={d.date}
                        label={`${d.date}: ${d.visitors}`}
                        size="small"
                        sx={{ backgroundColor: `${travelColors.primary.sky}20`, color: travelColors.primary.sky, fontWeight: 'bold' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Under-utilized destinations" textVariant="forest" variant="h6" sx={{ mb: 2 }} />
                {under.length === 0 && <Typography sx={{ color: travelColors.text.secondary }}>No data yet.</Typography>}
                {under.map((u: any) => (
                  <Box key={u.attraction_id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${travelColors.primary.forest}10` }}>
                    <Typography sx={{ fontWeight: 700 }}>{u.attraction_name}</Typography>
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      {(u.utilization_ratio != null ? `${Math.round(u.utilization_ratio * 100)}%` : '—')} · {u.district}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </TravelCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
              <Box sx={{ p: 3 }}>
                <TravelText text="Demand gaps (district)" textVariant="ocean" variant="h6" sx={{ mb: 2 }} />
                {gapDistricts.slice(0, 10).map((d: any) => (
                  <Box key={d.district_id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${travelColors.primary.ocean}10` }}>
                    <Typography sx={{ fontWeight: 700 }}>{d.district || `District ${d.district_id}`}</Typography>
                    <Typography sx={{ color: travelColors.text.secondary }}>
                      Score: {Math.round(d.gap_score)} · {d.recommendation}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </TravelCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TiInsightsPage;
