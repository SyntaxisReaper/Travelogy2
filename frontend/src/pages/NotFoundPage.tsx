import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles/techTheme';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      background: `radial-gradient(ellipse at center, ${colors.deepSpace} 0%, ${colors.darkBg} 100%)`
    }}>
      <Typography variant="h3" sx={{ color: colors.neonCyan }}>404 - Page Not Found</Typography>
      <Typography variant="body1" sx={{ color: '#ccc' }}>The page you are looking for doesn’t exist.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
    </Box>
  );
};

export default NotFoundPage;
