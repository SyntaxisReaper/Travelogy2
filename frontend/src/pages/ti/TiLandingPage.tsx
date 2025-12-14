import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Analytics, Map, Hotel, Sensors, Insights } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TravelCard from '../../components/TravelCard';
import AdventureButton from '../../components/AdventureButton';
import TravelText from '../../components/TravelText';
import { travelColors } from '../../styles/travelTheme';

const TiLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      title: 'State Dashboard',
      desc: 'Domestic vs international counts, peaks, and statewide utilization.',
      icon: <Analytics sx={{ fontSize: 40, color: travelColors.primary.forest }} />,
      to: '/ti/dashboard',
    },
    {
      title: 'Live Footfall',
      desc: '5-minute live buckets across attractions and districts.',
      icon: <Sensors sx={{ fontSize: 40, color: travelColors.primary.ocean }} />,
      to: '/ti/footfall',
    },
    {
      title: 'Attractions',
      desc: 'Directory + map-first access to attraction analytics.',
      icon: <Map sx={{ fontSize: 40, color: travelColors.primary.sunset }} />,
      to: '/ti/attractions',
    },
    {
      title: 'Hotels',
      desc: 'Capacity, ratings, district spread, CSV ingestion.',
      icon: <Hotel sx={{ fontSize: 40, color: travelColors.primary.coral }} />,
      to: '/ti/hotels',
    },
    {
      title: 'Insights',
      desc: 'Peak periods, under-utilized destinations, and demand gaps.',
      icon: <Insights sx={{ fontSize: 40, color: travelColors.primary.sky }} />,
      to: '/ti/insights',
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.ocean}08 100%)`,
      py: 4,
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <TravelText text="Tourism Intelligence" textVariant="adventure" animated variant="h3" />
          <Typography sx={{ mt: 1, color: travelColors.text.secondary }}>
            Rajasthan: real-time footfall + hotel infrastructure analytics (5-min buckets).
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <AdventureButton buttonVariant="ocean" onClick={() => navigate('/ti/dashboard')}>Open Dashboard</AdventureButton>
            <AdventureButton buttonVariant="sunset" onClick={() => navigate('/ti/admin/ingest')}>Ingest CSV / Manual</AdventureButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {tiles.map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.title}>
              <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {t.icon}
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{t.title}</Typography>
                  </Box>
                  <Typography sx={{ color: travelColors.text.secondary, mb: 2 }}>{t.desc}</Typography>
                  <AdventureButton
                    buttonVariant="forest"
                    size="small"
                    disabled={(t as any).disabled}
                    onClick={() => navigate(t.to)}
                  >
                    Open
                  </AdventureButton>
                </Box>
              </TravelCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TiLandingPage;
