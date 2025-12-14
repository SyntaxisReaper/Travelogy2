import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { travelColors } from '../styles/travelTheme';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  travel?: boolean;
  compact?: boolean;
}

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const TravelIcon = styled(Box)(() => ({
  fontSize: '2rem',
  animation: `${float} 2s ease-in-out infinite`,
  opacity: 0.8,
}));

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 40,
  travel = false,
  compact = false
}) => {
  const containerHeight = compact ? 'auto' : '100vh';
  const padding = compact ? 2 : 4;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={containerHeight}
      gap={2}
      p={padding}
    >
      {travel && (
        <TravelIcon>
          🌍
        </TravelIcon>
      )}
      <CircularProgress 
        size={size} 
        sx={travel ? {
          color: travelColors.primary.ocean,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        } : {}}
      />
      <Typography variant="body1" sx={{
        color: travel ? travelColors.text.primary : 'text.secondary',
        textAlign: 'center',
        maxWidth: 300
      }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;