import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import { tourismAPI } from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const TiAttractionDetailPage: React.FC = () => {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const a = await tourismAPI.getAttraction(String(id));
        setItem(a);
        const s = await tourismAPI.getFootfallTimeseries({ attraction_id: String(id) });
        setSeries(Array.isArray(s) ? s : []);
      } catch {
        setError('Failed to load attraction analytics');
      }
    };
    load();
  }, [id]);

  const chartData = useMemo(() => {
    return series.map((p) => ({
      t: new Date(p.bucket_start).toLocaleString(),
      total: (p.domestic || 0) + (p.international || 0) + (p.unknown || 0),
      domestic: p.domestic || 0,
      international: p.international || 0,
    }));
  }, [series]);

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.ocean}08 100%)`, py: 4 }}>
      <Container maxWidth="lg">
        <TravelText text={item?.name || 'Attraction'} textVariant="adventure" animated variant="h3" />
        <Typography sx={{ color: travelColors.text.secondary, mb: 2 }}>
          {(item?.district?.name || '—')} · 5-minute unique visitor buckets (hashed tokens)
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
          <Box sx={{ p: 3 }}>
            <TravelText text="Footfall timeseries" textVariant="gradient" variant="h6" sx={{ mb: 2 }} />
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={travelColors.primary.ocean} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={travelColors.primary.sky} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${travelColors.primary.ocean}20`} />
                  <XAxis dataKey="t" hide />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke={travelColors.primary.ocean} fill="url(#gradTotal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
            {chartData.length === 0 && (
              <Typography sx={{ mt: 2, color: travelColors.text.secondary }}>
                No data yet. Ingest hashed visitor tokens via `/api/tourism/ingest/footfall/`.
              </Typography>
            )}
          </Box>
        </TravelCard>
      </Container>
    </Box>
  );
};

export default TiAttractionDetailPage;
