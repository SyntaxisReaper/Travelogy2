import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { travelColors, travelStyles } from '../styles/travelTheme';

interface TravelLoaderProps {
  type?: 'compass' | 'waves' | 'journey' | 'explore' | 'adventure';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: string;
  fullscreen?: boolean;
}

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const waveMove = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100px); opacity: 0; }
`;

const journeyPath = keyframes`
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
`;

const gentleBounce = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 10px ${travelColors.primary.ocean}40; }
  50% { box-shadow: 0 0 25px ${travelColors.primary.ocean}60, 0 0 35px ${travelColors.primary.sunset}30; }
  100% { box-shadow: 0 0 10px ${travelColors.primary.ocean}40; }
`;

const LoaderContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullscreen',
})<{ fullscreen: boolean }>(({ fullscreen }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  ...(fullscreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: `linear-gradient(135deg, ${travelColors.backgrounds.cream} 0%, ${travelColors.backgrounds.lightSand} 100%)`,
    zIndex: 9999,
  }),
}));

const CompassLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Compass outer ring */}
      <Box
        sx={{
          position: 'absolute',
          width: size,
          height: size,
          border: `3px solid ${color}`,
          borderRadius: '50%',
          animation: `${rotate} 4s linear infinite`,
          opacity: 0.6,
        }}
      />
      
      {/* Compass inner elements */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 0.8,
          height: size * 0.8,
          border: `2px solid ${color}`,
          borderRadius: '50%',
          animation: `${rotate} 3s linear infinite reverse`,
          opacity: 0.4,
        }}
      />
      
      {/* Compass needle */}
      <Box
        sx={{
          position: 'absolute',
          width: 4,
          height: size * 0.6,
          background: `linear-gradient(180deg, ${travelColors.primary.coral} 0%, ${color} 100%)`,
          borderRadius: '2px',
          transformOrigin: 'center bottom',
          animation: `${rotate} 2s ease-in-out infinite`,
        }}
      />
      
      {/* Center dot */}
      <Box
        sx={{
          width: 8,
          height: 8,
          background: color,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

const WavesLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size * 0.6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '60px',
            height: '4px',
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            borderRadius: '2px',
            animation: `${waveMove} ${2 + i * 0.3}s linear infinite`,
            animationDelay: `${i * 0.2}s`,
            top: `${40 + i * 8}%`,
            opacity: 0.7 - i * 0.1,
          }}
        />
      ))}
    </Box>
  );
};

const JourneyLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const pathRef = useRef<SVGPathElement>(null);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path
          ref={pathRef}
          d="M20,50 Q30,20 50,50 T80,50"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="5,5"
          style={{
            animation: `${journeyPath} 3s ease-in-out infinite`,
          }}
        />
        
        {/* Journey markers */}
        <circle cx="20" cy="50" r="3" fill={travelColors.primary.forest} opacity="0.8" />
        <circle cx="50" cy="50" r="3" fill={travelColors.primary.sunset} opacity="0.6" />
        <circle cx="80" cy="50" r="3" fill={travelColors.primary.ocean} opacity="0.4" />
      </svg>
    </Box>
  );
};

const ExploreLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: color,
            borderRadius: '50%',
            animation: `${gentleBounce} ${1.5 + i * 0.1}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            transform: `rotate(${i * 45}deg) translateY(-${size / 3}px)`,
            transformOrigin: '6px 0px',
            opacity: 0.8,
          }}
        />
      ))}
    </Box>
  );
};

const AdventureLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Mountain silhouette */}
      <Box
        sx={{
          position: 'absolute',
          width: size * 0.8,
          height: size * 0.6,
          background: `linear-gradient(45deg, transparent 50%, ${color} 51%)`,
          animation: `${pulseGlow} 2s ease-in-out infinite`,
        }}
      />
      
      {/* Sun/moon */}
      <Box
        sx={{
          position: 'absolute',
          top: size * 0.1,
          right: size * 0.2,
          width: size * 0.25,
          height: size * 0.25,
          background: travelColors.primary.sunset,
          borderRadius: '50%',
          animation: `${rotate} 8s linear infinite`,
          boxShadow: `0 0 15px ${travelColors.primary.sunset}50`,
        }}
      />
    </Box>
  );
};

const TravelLoader: React.FC<TravelLoaderProps> = ({
  type = 'compass',
  size = 'medium',
  text = 'Loading your adventure...',
  color = travelColors.primary.ocean,
  fullscreen = false,
}) => {
  const sizeMap = {
    small: 60,
    medium: 100,
    large: 150,
  };

  const loaderSize = sizeMap[size];

  const renderLoader = () => {
    switch (type) {
      case 'compass':
        return <CompassLoader size={loaderSize} color={color} />;
      case 'waves':
        return <WavesLoader size={loaderSize} color={color} />;
      case 'journey':
        return <JourneyLoader size={loaderSize} color={color} />;
      case 'explore':
        return <ExploreLoader size={loaderSize} color={color} />;
      case 'adventure':
        return <AdventureLoader size={loaderSize} color={color} />;
      default:
        return <CompassLoader size={loaderSize} color={color} />;
    }
  };

  return (
    <LoaderContainer fullscreen={fullscreen}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderLoader()}
      </motion.div>
      
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            variant="h6"
            sx={{
              color,
              textAlign: 'center',
              fontFamily: travelStyles.fonts.primary,
              letterSpacing: '0.02em',
              animation: `${gentleBounce} 2s ease-in-out infinite`,
            }}
          >
            {text}
          </Typography>
        </motion.div>
      )}

      {/* Progress dots */}
      <Box
        sx={{
          display: 'flex',
          gap: '8px',
          mt: 2,
        }}
      >
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              background: color,
              borderRadius: '50%',
              animation: `${gentleBounce} 1s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </Box>
    </LoaderContainer>
  );
};

export default TravelLoader;