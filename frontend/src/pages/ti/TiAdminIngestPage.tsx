import React, { useState } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { travelColors } from '../../styles/travelTheme';
import TravelCard from '../../components/TravelCard';
import TravelText from '../../components/TravelText';
import AdventureButton from '../../components/AdventureButton';
import { tourismAPI } from '../../services/api';

const TiAdminIngestPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (kind: 'registry' | 'snapshot', file: File) => {
    setUploading(true);
    setError(null);
    setOk(null);
    try {
      if (kind === 'registry') {
        const res = await tourismAPI.uploadHotelRegistryCsv(file);
        setOk(`Registry uploaded: created ${res.created}, updated ${res.updated}`);
      } else {
        const res = await tourismAPI.uploadHotelSnapshotCsv(file);
        setOk(`Snapshots ingested: ${res.ingested}`);
      }
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 50%, ${travelColors.primary.sky}10 100%)`, py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <UploadFile sx={{ fontSize: 36, color: travelColors.primary.sky, mr: 1 }} />
          <TravelText text="Ingestion (Hackathon Mode)" textVariant="adventure" animated variant="h3" />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {ok && <Alert severity="success" sx={{ mb: 3 }}>{ok}</Alert>}

        <TravelCard cardVariant="paper" cardElevation="medium" borderAccent sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <TravelText text="Hotel registry CSV" textVariant="gradient" variant="h6" sx={{ mb: 1 }} />
            <Typography sx={{ color: travelColors.text.secondary, mb: 2 }}>
              Columns: name, district, rating(optional), rooms_total(optional), beds_total(optional), lat(optional), lon(optional), category(optional)
            </Typography>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload('registry', f);
              }}
            />
          </Box>
        </TravelCard>

        <TravelCard cardVariant="paper" cardElevation="medium" borderAccent>
          <Box sx={{ p: 3 }}>
            <TravelText text="Hotel availability snapshots CSV" textVariant="wanderlust" variant="h6" sx={{ mb: 1 }} />
            <Typography sx={{ color: travelColors.text.secondary, mb: 2 }}>
              Columns: hotel_name, district, ts(ISO datetime), rooms_available, rooms_total(optional)
            </Typography>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload('snapshot', f);
              }}
            />
          </Box>
        </TravelCard>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <AdventureButton buttonVariant="ocean" onClick={() => window.location.assign('/ti')}>
            Back to Tourism Intelligence
          </AdventureButton>
        </Box>
      </Container>
    </Box>
  );
};

export default TiAdminIngestPage;
