import React, { useState } from 'react';
import { Card, CardProps, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../styles/techTheme';

interface HolographicCardProps extends CardProps {
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  scanlines?: boolean;
}

const holographicGlow = keyframes`
  0% {
    box-shadow: 
      0 0 20px ${colors.neonCyan}40,
      inset 0 0 20px ${colors.neonCyan}20,
      0 0 40px ${colors.neonCyan}20;
  }
  25% {
    box-shadow: 
      0 0 30px ${colors.neonPink}40,
      inset 0 0 30px ${colors.neonPink}20,
      0 0 60px ${colors.neonPink}20;
  }
  50% {
    box-shadow: 
      0 0 25px ${colors.neonGreen}40,
      inset 0 0 25px ${colors.neonGreen}20,
      0 0 50px ${colors.neonGreen}20;
  }
  75% {
    box-shadow: 
      0 0 35px ${colors.neonBlue}40,
      inset 0 0 35px ${colors.neonBlue}20,
      0 0 70px ${colors.neonBlue}20;
  }
  100% {
    box-shadow: 
      0 0 20px ${colors.neonCyan}40,
      inset 0 0 20px ${colors.neonCyan}20,
      0 0 40px ${colors.neonCyan}20;
  }
`;

const scanlineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 1;
  }
  100% {
    transform: translateY(300%);
    opacity: 0;
  }
`;

const HolographicContainer = styled(Card, {
  shouldForwardProp: (prop) => !['glowColor', 'intensity', 'animated', 'scanlines'].includes(prop as string),
})<HolographicCardProps>(
  ({ theme, glowColor = colors.neonCyan, intensity = 'low', animated = false, scanlines = false }) => {
    const glowIntensity = intensity === 'low' ? 0.15 : intensity === 'medium' ? 0.3 : 0.45;
    
    return {
      position: 'relative',
      background: `
        linear-gradient(135deg, 
          ${colors.darkCard}e6 0%, 
          ${colors.carbonFiber}e6 50%, 
          ${colors.darkCard}e6 100%
        )
      `,
      backdropFilter: 'blur(15px)',
      border: `1px solid ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      animation: animated ? `${holographicGlow} 4s ease-in-out infinite` : 'none',
      
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: `
          0 20px 60px ${glowColor}${Math.floor(glowIntensity * 100).toString(16).padStart(2, '0')},
          inset 0 1px 0 ${colors.neonCyan}40,
          inset 0 -1px 0 ${colors.neonPink}40
        `,
        border: `1px solid ${glowColor}`,
      },

      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(
          90deg, 
          transparent, 
          ${colors.neonCyan}20, 
          transparent
        )`,
        transition: 'left 0.5s ease',
        zIndex: 1,
      },

      '&:hover::before': {
        left: '100%',
      },

      // Scanlines effect
      ...(scanlines && {
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(
            90deg, 
            transparent, 
            ${colors.neonCyan}, 
            transparent
          )`,
          animation: `${scanlineAnimation} 3s linear infinite`,
          zIndex: 2,
        },
      }),
    };
  }
);

const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  glowColor,
  intensity,
  animated,
  scanlines,
  sx,
  ...cardProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ 
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
      }}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HolographicContainer
        glowColor={glowColor}
        intensity={intensity}
        animated={animated}
        scanlines={scanlines}
        sx={{
          position: 'relative',
          ...sx,
        }}
        {...cardProps}
      >
        {children}
        
        {/* Additional holographic overlay effects */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${colors.neonPink}15 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${colors.neonCyan}15 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${colors.neonGreen}10 0%, transparent 50%)
            `,
            opacity: isHovered ? 0.7 : 0.3,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        
        {/* Corner accents */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 20,
            height: 20,
            border: `2px solid ${colors.neonCyan}`,
            borderRight: 'none',
            borderBottom: 'none',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            border: `2px solid ${colors.neonCyan}`,
            borderLeft: 'none',
            borderBottom: 'none',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            width: 20,
            height: 20,
            border: `2px solid ${colors.neonCyan}`,
            borderRight: 'none',
            borderTop: 'none',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 20,
            height: 20,
            border: `2px solid ${colors.neonCyan}`,
            borderLeft: 'none',
            borderTop: 'none',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
      </HolographicContainer>
    </motion.div>
  );
};

export default HolographicCard;