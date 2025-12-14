import React from 'react';
import { Box, Typography } from '@mui/material';
import { travelColors } from '../styles/travelTheme';

const InlineAnimationTest: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h3" sx={{ 
        color: travelColors.primary.ocean,
        mb: 3
      }}>
        🧪 Inline Animation Test
      </Typography>
      
      {/* Simple inline bouncing animation */}
      <div style={{
        display: 'inline-block',
        fontSize: '4rem',
        animation: 'bounce 1s infinite',
        margin: '0 20px'
      }}>
        🌍
      </div>
      
      {/* Spinning animation */}
      <div style={{
        display: 'inline-block',
        fontSize: '4rem',
        animation: 'spin 2s linear infinite',
        margin: '0 20px'
      }}>
        ⭐
      </div>
      
      {/* Pulsing animation */}
      <div style={{
        display: 'inline-block',
        fontSize: '4rem',
        animation: 'pulse 2s infinite',
        margin: '0 20px'
      }}>
        ✈️
      </div>

      <Typography variant="h4" sx={{ 
        color: travelColors.primary.sunset,
        mt: 4,
        animation: 'fadeIn 2s ease-in'
      }}>
        This should be fading in
      </Typography>
      
      <Typography variant="body1" sx={{ mt: 2, color: travelColors.text.secondary }}>
        If you don't see animations above, there might be a browser/system issue
      </Typography>

      {/* Embed the keyframes directly in a style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-30px);
            }
            60% {
              transform: translateY(-15px);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
    </Box>
  );
};

export default InlineAnimationTest;