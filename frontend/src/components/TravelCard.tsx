import React, { useState } from 'react';
import { Card, CardProps, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { travelColors, travelStyles } from '../styles/travelTheme';

interface TravelCardProps extends Omit<CardProps, 'variant' | 'elevation'> {
  cardVariant?: 'default' | 'ocean' | 'sunset' | 'forest' | 'paper' | 'coral';
  cardElevation?: 'low' | 'medium' | 'high';
  borderAccent?: boolean;
  interactive?: boolean;
}

const gentleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
`;

const paperShimmer = keyframes`
  0% {
    background-position: -200% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
`;

const getVariantStyles = (cardVariant: string, cardElevation: string) => {
  const elevationShadows = {
    low: travelColors.shadows.soft,
    medium: travelColors.shadows.medium,
    high: travelColors.shadows.large,
  };

  const baseStyles = {
    borderRadius: travelStyles.borderRadius.large,
    transition: travelStyles.transitions.medium,
    boxShadow: elevationShadows[cardElevation as keyof typeof elevationShadows],
  };

  switch (cardVariant) {
    case 'ocean':
      return {
        ...baseStyles,
        background: `
          linear-gradient(135deg, 
            ${travelColors.backgrounds.paper} 0%, 
            ${travelColors.primary.sky}20 100%
          )
        `,
        border: `1px solid ${travelColors.primary.ocean}30`,
        '&:hover': {
          boxShadow: `0 8px 32px ${travelColors.primary.ocean}20`,
          border: `1px solid ${travelColors.primary.ocean}50`,
        },
      };
    case 'sunset':
      return {
        ...baseStyles,
        background: `
          linear-gradient(135deg, 
            ${travelColors.backgrounds.paper} 0%, 
            ${travelColors.primary.sunset}15 100%
          )
        `,
        border: `1px solid ${travelColors.primary.sunset}30`,
        '&:hover': {
          boxShadow: travelColors.shadows.warm,
          border: `1px solid ${travelColors.primary.sunset}50`,
        },
      };
    case 'forest':
      return {
        ...baseStyles,
        background: `
          linear-gradient(135deg, 
            ${travelColors.backgrounds.paper} 0%, 
            ${travelColors.primary.forest}15 100%
          )
        `,
        border: `1px solid ${travelColors.primary.forest}30`,
        '&:hover': {
          boxShadow: `0 8px 32px ${travelColors.primary.forest}20`,
          border: `1px solid ${travelColors.primary.forest}50`,
        },
      };
    case 'paper':
      return {
        ...baseStyles,
        background: travelColors.backgrounds.paper,
        border: `1px solid ${travelColors.text.light}20`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(
              90deg,
              transparent,
              ${travelColors.primary.sand}40,
              transparent
            )
          `,
          backgroundSize: '200% 100%',
          animation: `${paperShimmer} 3s ease-in-out infinite`,
          borderRadius: 'inherit',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        },
        '&:hover::before': {
          opacity: 1,
        },
        '&:hover': {
          boxShadow: travelColors.shadows.paper,
        },
      };
    case 'coral':
      return {
        ...baseStyles,
        background: `
          linear-gradient(135deg, 
            ${travelColors.backgrounds.paper} 0%, 
            ${travelColors.primary.coral}15 100%
          )
        `,
        border: `1px solid ${travelColors.primary.coral}30`,
        '&:hover': {
          boxShadow: `0 8px 32px ${travelColors.primary.coral}20`,
          border: `1px solid ${travelColors.primary.coral}50`,
        },
      };
    default:
      return {
        ...baseStyles,
        background: travelColors.backgrounds.paper,
        border: `1px solid ${travelColors.text.light}20`,
        '&:hover': {
          boxShadow: elevationShadows[cardElevation as keyof typeof elevationShadows],
          border: `1px solid ${travelColors.primary.ocean}30`,
        },
      };
  }
};

const TravelCardContainer = styled(Card)(() => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: travelStyles.borderRadius.large,
    transition: travelStyles.transitions.medium,
    boxShadow: travelColors.shadows.medium,
    background: travelColors.backgrounds.paper,
    border: `1px solid ${travelColors.text.light}20`,
    
    '&:hover': {
      boxShadow: travelColors.shadows.large,
      border: `1px solid ${travelColors.primary.ocean}30`,
      transform: 'translateY(-4px)',
    },
  })
);

const TravelCard: React.FC<TravelCardProps> = ({
  children,
  cardVariant,
  cardElevation,
  borderAccent,
  interactive,
  sx,
  ...cardProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const motionProps = interactive ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: { 
      y: -4,
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
    },
    transition: { duration: 0.4 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  return (
    <motion.div
      {...motionProps}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <TravelCardContainer
        sx={{
          position: 'relative',
          ...getVariantStyles(cardVariant || 'default', cardElevation || 'medium'),
          ...(borderAccent && {
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 8,
              left: 8,
              width: 20,
              height: 20,
              border: `2px solid ${travelColors.primary.ocean}`,
              borderRight: 'none',
              borderBottom: 'none',
              opacity: 0.6,
            },
          }),
          ...sx,
        } as any}
        {...cardProps}
      >
        {children}
        
        {/* Subtle texture overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${travelColors.primary.sand}08 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${travelColors.primary.sky}08 0%, transparent 50%)
            `,
            opacity: isHovered ? 0.8 : 0.4,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
        
        {/* Travel-themed corner decorations */}
        {borderAccent && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                width: 3,
                height: 20,
                background: travelColors.primary.ocean,
                borderRadius: '2px',
                opacity: 0.7,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                width: 20,
                height: 3,
                background: travelColors.primary.ocean,
                borderRadius: '2px',
                opacity: 0.7,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 3,
                height: 20,
                background: travelColors.primary.sunset,
                borderRadius: '2px',
                opacity: 0.7,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 20,
                height: 3,
                background: travelColors.primary.sunset,
                borderRadius: '2px',
                opacity: 0.7,
              }}
            />
          </>
        )}
      </TravelCardContainer>
    </motion.div>
  );
};

export default TravelCard;