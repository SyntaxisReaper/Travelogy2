import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, TextField, Alert, Chip } from '@mui/material';
import { Map } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import AdventureButton from '../../components/AdventureButton';
import { tourismAPI } from '../../services/api';

type District = { id: number; name: string };

const TiAttractionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string>('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [types, setTypes] = useState<Array<{ key: string; label: string }>>([]);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const meta = await tourismAPI.getMeta();
        setDistricts(meta.districts || []);
        setTypes(meta.attraction_types || []);
      } catch {
        setError('Failed to load meta');
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await tourismAPI.listAttractions({ district_id: districtId || undefined, q: q || undefined, attraction_type: type || undefined });
        setItems(Array.isArray(res) ? res : (res?.results || []));
      } catch {
        setError('Failed to load attractions');
      }
    };
    load();
  }, [districtId, q, type]);

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sunset}08 100%)`, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Map sx={{ fontSize: 36, color: travelColors.primary.sunset, mr: 1 }} />
          <TravelText text="Attractions" textVariant="adventure" animated variant="h3" />
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
              sx={{ minWidth: 220 }}
            >
              <option value="">All districts</option>
              {districts.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
            </TextField>
            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 220 }}
            >
              <option value="">All types</option>
              {types.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </TextField>
            <TextField
              label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 260, flex: 1 }}
            />
            <AdventureButton buttonVariant="ocean" onClick={() => navigate('/ti/footfall')}>
              Open Live Footfall
            </AdventureButton>
          </Box>
        </TravelCard>

        <Grid container spacing={3}>
          {items.map((a) => (
            <Grid item xs={12} md={6} key={a.id}>
              <TravelCard cardVariant="default" cardElevation="medium" borderAccent>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{a.name}</Typography>
                  <Typography sx={{ color: travelColors.text.secondary, mb: 1 }}>
                    {(a.district?.name || '—')} · {(a.attraction_type || 'other')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {a.capacity_per_5min != null && <Chip label={`Cap/5m: ${a.capacity_per_5min}`} size="small" />}
                    {a.crowd_threshold_warn != null && <Chip label={`Warn: ${a.crowd_threshold_warn}`} size="small" />}
                    {a.crowd_threshold_critical != null && <Chip label={`Critical: ${a.crowd_threshold_critical}`} size="small" />}
                  </Box>
                  <AdventureButton buttonVariant="sunset" size="small" onClick={() => navigate(`/ti/attractions/${a.id}`)}>
                    View details
                  </AdventureButton>
                </Box>
              </TravelCard>
            </Grid>
          ))}
          {items.length === 0 && (
            <Grid item xs={12}>
              <Typography sx={{ textAlign: 'center', color: travelColors.text.secondary }}>
                No attractions found. Create them via the API or Django admin.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default TiAttractionsPage;
