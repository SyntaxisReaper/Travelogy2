import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Grid, Chip, Alert } from '@mui/material';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { motion } from 'framer-motion';
import { Analytics, TrendingUp, Map as MapIcon } from '@mui/icons-material';
import { travelColors } from '../styles/travelTheme';
import TravelCard from '../components/TravelCard';
import TravelText from '../components/TravelText';
import { tripsAPI } from '../services/api';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface HeatPoint { lat: number; lon: number; weight?: number }

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [heat, setHeat] = useState<HeatPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, h] = await Promise.all([
          tripsAPI.getStats().catch(() => null),
          tripsAPI.getHeatmap().catch(() => []),
        ]);
        setStats(s);
        const points: HeatPoint[] = Array.isArray(h)
          ? h.map((p: any) => ({ lat: p.lat || p.latitude, lon: p.lon || p.longitude, weight: p.weight }))
          : [];
        setHeat(points.filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number'));
      } catch (e) {
        setError('Failed to load analytics');
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    // Accept several shapes: stats.timeline, stats.monthly, etc.
    const timeline = stats.timeline || stats.monthly || [];
    return timeline.map((x: any) => ({ name: x.label || x.month || x.day, trips: x.trips || x.count || 0 }));
  }, [stats]);

  const center: LatLngExpression = heat.length ? [heat[0].lat, heat[0].lon] : [20, 0];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.forest}08 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '6%',
          right: '8%',
          width: '160px',
          height: '160px',
          background: `radial-gradient(circle, ${travelColors.primary.sunset}12 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '190px',
          height: '190px',
          background: `radial-gradient(circle, ${travelColors.primary.coral}10 0%, transparent 70%)`,
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
            <Analytics sx={{ fontSize: 40, color: travelColors.primary.forest, mr: 2 }} />
            <TravelText
              text="Travel Analytics"
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

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TravelCard cardVariant="ocean" cardElevation="medium" borderAccent>
                <Box sx={{ p: 3 }}>
                  <TravelText
                    text="Overview"
                    textVariant="gradient"
                    variant="h6"
                    sx={{ mb: 3 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Total trips: ${stats?.total_trips ?? 0}`} 
                      sx={{ 
                        backgroundColor: `${travelColors.primary.ocean}20`,
                        color: travelColors.primary.ocean,
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip 
                      label={`Distance: ${Math.round(stats?.total_distance ?? 0)} km`} 
                      sx={{ 
                        backgroundColor: `${travelColors.primary.sunset}20`,
                        color: travelColors.primary.sunset,
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip 
                      label={`Eco score: ${stats?.eco_score ?? 0}`} 
                      sx={{ 
                        backgroundColor: `${travelColors.primary.forest}20`,
                        color: travelColors.primary.forest,
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>
              </TravelCard>
            </Grid>
            <Grid item xs={12} md={8}>
              <TravelCard cardVariant="sunset" cardElevation="medium" borderAccent>
                <Box sx={{ p: 3, height: 260 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ fontSize: 24, color: travelColors.primary.sunset, mr: 1 }} />
                    <TravelText
                      text="Trips Over Time"
                      textVariant="wanderlust"
                      variant="h6"
                    />
                  </Box>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gradTrips" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={travelColors.primary.sunset} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={travelColors.primary.coral} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.sunset}30`} />
                      <XAxis dataKey="name" stroke={travelColors.text.secondary} />
                      <YAxis stroke={travelColors.text.secondary} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: travelColors.backgrounds.paper,
                          border: `1px solid ${travelColors.primary.sunset}40`,
                          borderRadius: '8px',
                          color: travelColors.text.primary
                        }}
                      />
                      <Area type="monotone" dataKey="trips" stroke={travelColors.primary.sunset} fill="url(#gradTrips)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </TravelCard>
            </Grid>

            <Grid item xs={12}>
              <TravelCard cardVariant="forest" cardElevation="high" borderAccent>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MapIcon sx={{ fontSize: 28, color: travelColors.primary.forest, mr: 1 }} />
                    <TravelText
                      text="Trip Density Map"
                      textVariant="adventure"
                      variant="h6"
                    />
                  </Box>
                  <Box sx={{ 
                    height: 380, 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `2px solid ${travelColors.primary.forest}30`
                  }}>
                    <MapContainer center={center} zoom={heat.length ? 6 : 2} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {heat.map((p, i) => (
                        <Circle 
                          key={i} 
                          center={[p.lat, p.lon] as LatLngExpression} 
                          radius={2000 * (p.weight || 1)} 
                          pathOptions={{ 
                            color: travelColors.primary.coral, 
                            fillColor: travelColors.primary.sunset,
                            opacity: 0.7,
                            fillOpacity: 0.4
                          }} 
                        />
                      ))}
                    </MapContainer>
                  </Box>
                </Box>
              </TravelCard>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AnalyticsPage;
