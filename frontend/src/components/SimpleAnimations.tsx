import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { travelColors } from '../styles/travelTheme';

// Define keyframes
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
`;

// Styled components
const BounceBox = styled(Box)`
  animation: ${bounce} 2s infinite;
  display: inline-block;
`;

const PulseBox = styled(Box)`
  animation: ${pulse} 1.5s infinite;
  display: inline-block;
`;

const RotateBox = styled(Box)`
  animation: ${rotate} 3s linear infinite;
  display: inline-block;
`;

const ShimmerText = styled(Typography)`
  background: linear-gradient(90deg, ${travelColors.primary.ocean}, ${travelColors.primary.sunset}, ${travelColors.primary.forest}, ${travelColors.primary.ocean});
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`;

// Simple typewriter effect with React state
const SimpleTypewriter: React.FC<{ text: string; speed?: number }> = ({ text, speed = 100 }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <Typography variant="h5" sx={{ 
      color: travelColors.primary.ocean,
      fontFamily: 'monospace',
      minHeight: '1.2em'
    }}>
      {displayText}
      <Box component="span" sx={{
        animation: 'blink 1s infinite',
        '@keyframes blink': {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 },
        }
      }}>
        |
      </Box>
    </Typography>
  );
};

interface SimpleAnimationsProps {
  showAll?: boolean;
}

const SimpleAnimations: React.FC<SimpleAnimationsProps> = ({ showAll = false }) => {
  const [currentMessage, setCurrentMessage] = React.useState(0);
  const messages = [
    "🌍 Welcome to Travelogy!",
    "🗺️ Track your adventures",
    "📍 GPS-powered journeys",
    "✨ Create lasting memories"
  ];

  React.useEffect(() => {
    if (!showAll) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showAll, messages.length]);

  if (showAll) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: travelColors.primary.ocean }}>
          🧪 Animation Tests
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
          <BounceBox>
            <Typography variant="h3">🌍</Typography>
          </BounceBox>
          
          <PulseBox>
            <Typography variant="h3">✈️</Typography>
          </PulseBox>
          
          <RotateBox>
            <Typography variant="h3">⭐</Typography>
          </RotateBox>
        </Box>

        <ShimmerText variant="h4" gutterBottom>
          Shimmer Text Animation
        </ShimmerText>

        <Box sx={{ mt: 4 }}>
          <SimpleTypewriter text="This text should type out character by character..." />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', minHeight: '100px', py: 2 }}>
      <SimpleTypewriter key={currentMessage} text={messages[currentMessage]} speed={80} />
    </Box>
  );
};

export default SimpleAnimations;