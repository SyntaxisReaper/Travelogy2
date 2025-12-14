import React, { useState, useEffect } from 'react';
import { Box, Typography, TypographyProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { travelColors, travelStyles } from '../styles/travelTheme';

interface TravelTextProps extends TypographyProps {
  text: string;
  textVariant?: 'gradient' | 'wanderlust' | 'adventure' | 'simple';
  animated?: boolean;
  typewriter?: boolean;
  speed?: number;
}

const wanderlustShimmer = keyframes`
  0% {
    background-position: -200% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
`;

const adventureFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
`;

const gentleGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px ${travelColors.primary.ocean}40;
  }
  50% {
    text-shadow: 0 0 20px ${travelColors.primary.ocean}60, 0 0 30px ${travelColors.primary.sunset}30;
  }
`;

const TravelTextContainer = styled(Box)<{
  textVariant?: string;
  animated?: boolean;
}>(({ textVariant = 'simple', animated = false }) => ({
  position: 'relative',
  display: 'inline-block',
  transition: travelStyles.transitions.medium,
  ...getTextContainerStyles(textVariant, animated),
}));

const getTextContainerStyles = (textVariant: string, animated: boolean) => {
  const baseStyles = {};
  return baseStyles;
};

const getTextStyles = (textVariant: string, animated: boolean) => {
    switch (textVariant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${travelColors.primary.ocean}, ${travelColors.primary.sunset}, ${travelColors.primary.forest})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 200%',
          animation: animated ? `${wanderlustShimmer} 3s ease-in-out infinite` : 'none',
        };
        
      case 'wanderlust':
        return {
          background: `linear-gradient(90deg, ${travelColors.primary.ocean}, ${travelColors.primary.coral}, ${travelColors.primary.sunset})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '300% 100%',
          animation: animated ? `${wanderlustShimmer} 4s ease-in-out infinite` : 'none',
          fontFamily: travelStyles.fonts.accent,
          fontWeight: 600,
        };
        
      case 'adventure':
        return {
          color: travelColors.primary.ocean,
          fontFamily: travelStyles.fonts.accent,
          fontWeight: 700,
          textShadow: `0 2px 4px ${travelColors.primary.ocean}20`,
          animation: animated ? `${adventureFloat} 3s ease-in-out infinite, ${gentleGlow} 4s ease-in-out infinite` : 'none',
          '&:hover': {
            color: travelColors.primary.sunset,
            textShadow: `0 4px 8px ${travelColors.primary.sunset}30`,
            transform: 'scale(1.02)',
          },
        };
        
      default: // simple
        return {
          color: travelColors.text.primary,
          fontFamily: travelStyles.fonts.primary,
          transition: travelStyles.transitions.medium,
          '&:hover': {
            color: travelColors.primary.ocean,
          },
        };
    }
  };

const TravelText: React.FC<TravelTextProps> = ({
  text,
  textVariant = 'simple',
  animated = false,
  typewriter = false,
  speed = 100,
  sx,
  ...typographyProps
}) => {
  const [displayText, setDisplayText] = useState(typewriter ? '' : text);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (typewriter && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, typewriter, speed]);

  useEffect(() => {
    if (typewriter) {
      setDisplayText('');
      setCurrentIndex(0);
    } else {
      setDisplayText(text);
    }
  }, [text, typewriter]);

  return (
    <TravelTextContainer
      textVariant={textVariant}
      animated={animated}
      sx={sx}
    >
      <Typography
        className="travel-text"
        sx={{
          ...getTextStyles(textVariant, animated),
        }}
        {...typographyProps}
      >
        {displayText}
        {typewriter && currentIndex < text.length && (
          <Box
            component="span"
            sx={{
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 50%': { opacity: 1 },
                '51%, 100%': { opacity: 0 },
              },
            }}
          >
            |
          </Box>
        )}
      </Typography>
      
      {/* Decorative elements for adventure variant */}
      {textVariant === 'adventure' && animated && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '8px',
              height: '8px',
              background: travelColors.primary.sunset,
              borderRadius: '50%',
              animation: `${adventureFloat} 2s ease-in-out infinite reverse`,
              opacity: 0.6,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-8px',
              left: '-8px',
              width: '6px',
              height: '6px',
              background: travelColors.primary.ocean,
              borderRadius: '50%',
              animation: `${adventureFloat} 2.5s ease-in-out infinite`,
              opacity: 0.4,
            }}
          />
        </>
      )}
      
      {/* Wanderlust sparkles */}
      {textVariant === 'wanderlust' && animated && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, ${travelColors.primary.coral}30 2px, transparent 2px),
              radial-gradient(circle at 80% 80%, ${travelColors.primary.sky}30 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 30px 30px',
            animation: `${wanderlustShimmer} 6s linear infinite`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      )}
    </TravelTextContainer>
  );
};

export default TravelText;