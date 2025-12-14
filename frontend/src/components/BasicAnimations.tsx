import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { travelColors } from '../styles/travelTheme';

const BasicAnimations: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    "🌍 Welcome to Travelogy!",
    "🗺️ Track your adventures",
    "📍 GPS-powered journeys", 
    "✨ Create lasting memories"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: 4,
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: travelColors.primary.ocean,
        marginBottom: 4
      }}>
        🧪 Animation Test Area
      </Typography>
      
      {/* Basic CSS Animations */}
      <Box sx={{ 
        display: 'flex', 
        gap: 4, 
        mb: 4, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Box className="animate-bounce" sx={{ fontSize: '3rem' }}>
          🌍
        </Box>
        <Box className="animate-pulse" sx={{ fontSize: '3rem' }}>
          ✈️
        </Box>
        <Box className="animate-rotate" sx={{ fontSize: '3rem' }}>
          ⭐
        </Box>
        <Box className="animate-float" sx={{ fontSize: '3rem' }}>
          📸
        </Box>
      </Box>

      {/* Glowing Text */}
      <Typography 
        variant="h3" 
        className="animate-glow"
        sx={{ 
          color: travelColors.primary.ocean,
          fontFamily: '"Playfair Display", serif',
          mb: 3
        }}
      >
        Animated Title
      </Typography>

      {/* Cycling Messages */}
      <Typography 
        key={currentMessage}
        variant="h5" 
        className="animate-fadeInUp"
        sx={{ 
          color: travelColors.primary.sunset,
          fontWeight: 500,
          minHeight: '2em'
        }}
      >
        {messages[currentMessage]}
      </Typography>

      {/* Hover Effects */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box 
          className="hover-grow"
          sx={{
            padding: '10px 20px',
            backgroundColor: travelColors.primary.ocean,
            color: 'white',
            borderRadius: 2,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Hover to Grow
        </Box>
        <Box 
          className="hover-glow"
          sx={{
            padding: '10px 20px',
            backgroundColor: travelColors.primary.sunset,
            color: 'white',
            borderRadius: 2,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Hover to Glow
        </Box>
      </Box>

      <Typography variant="body2" sx={{ 
        mt: 3,
        color: travelColors.text.secondary,
        fontStyle: 'italic'
      }}>
        ↑ These should be animating with pure CSS
      </Typography>
    </Box>
  );
};

export default BasicAnimations;