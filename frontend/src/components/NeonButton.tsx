import React, { useState } from 'react';
import { Button, ButtonProps, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../styles/techTheme';

interface NeonButtonProps extends ButtonProps {
  glowColor?: string;
  pulseAnimation?: boolean;
  rippleEffect?: boolean;
  borderAnimation?: boolean;
  textColor?: string;
}

const neonPulse = keyframes`
  0% {
    box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
  }
  50% {
    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
  }
  100% {
    box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
  }
`;

const borderGlow = keyframes`
  0% {
    border-color: currentColor;
    box-shadow: 0 0 5px currentColor;
  }
  25% {
    border-color: ${colors.neonPink};
    box-shadow: 0 0 10px ${colors.neonPink};
  }
  50% {
    border-color: ${colors.neonGreen};
    box-shadow: 0 0 15px ${colors.neonGreen};
  }
  75% {
    border-color: ${colors.neonBlue};
    box-shadow: 0 0 10px ${colors.neonBlue};
  }
  100% {
    border-color: currentColor;
    box-shadow: 0 0 5px currentColor;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const NeonButtonContainer = styled(Button, {
  shouldForwardProp: (prop) => !['glowColor', 'pulseAnimation', 'borderAnimation', 'textColor', 'rippleEffect'].includes(prop as string),
})<NeonButtonProps>(
  ({ glowColor = colors.neonCyan, pulseAnimation = false, borderAnimation = false, textColor = '#e6f8ff' }) => ({
    position: 'relative',
    padding: '12px 24px',
    background: `
      linear-gradient(135deg, 
        ${colors.darkCard}40 0%, 
        ${colors.carbonFiber}60 50%, 
        ${colors.darkCard}40 100%
      )
    `,
    backdropFilter: 'blur(10px)',
    border: `2px solid ${glowColor}`,
    borderRadius: '8px',
    color: textColor,
    fontFamily: '"Orbitron", "Roboto Mono", monospace',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textShadow: `0 0 10px ${glowColor}`,
    boxShadow: `
      0 0 10px ${glowColor}40,
      inset 0 1px 0 ${colors.neonCyan}20,
      inset 0 -1px 0 ${colors.neonPink}20
    `,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    animation: pulseAnimation ? `${neonPulse} 2s ease-in-out infinite` : 'none',
    
    '&:hover': {
      background: `
        linear-gradient(135deg, 
          ${colors.darkCard}60 0%, 
          ${colors.carbonFiber}80 50%, 
          ${colors.darkCard}60 100%
        )
      `,
      boxShadow: `
        0 0 20px ${glowColor}60,
        0 0 40px ${glowColor}40,
        inset 0 1px 0 ${colors.neonCyan}40,
        inset 0 -1px 0 ${colors.neonPink}40
      `,
      transform: 'translateY(-2px) scale(1.05)',
      animation: borderAnimation ? `${borderGlow} 1.5s ease-in-out infinite` : 
                 pulseAnimation ? `${neonPulse} 1s ease-in-out infinite` : 'none',
    },

    '&:active': {
      transform: 'translateY(0px) scale(1.02)',
    },

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      '&:hover': {
        transform: 'none',
        boxShadow: `0 0 5px ${glowColor}20`,
      },
    },

    // Sweep effect
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
        ${glowColor}30, 
        transparent
      )`,
      transition: 'left 0.5s ease',
      zIndex: 0,
    },

    '&:hover::before': {
      left: '100%',
    },

    // Circuit pattern overlay
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        linear-gradient(45deg, transparent 30%, ${glowColor}10 30%, ${glowColor}10 70%, transparent 70%),
        linear-gradient(-45deg, transparent 30%, ${glowColor}05 30%, ${glowColor}05 70%, transparent 70%)
      `,
      backgroundSize: '4px 4px',
      opacity: 0.3,
      zIndex: 0,
    },

    // Content should be above overlays
    '& .MuiButton-startIcon, & .MuiButton-endIcon, & span': {
      position: 'relative',
      zIndex: 1,
    },
  })
);

const RippleEffect = styled('span')<{ animate: boolean }>(({ animate }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(0, 255, 255, 0.3)',
  transform: 'scale(0)',
  animation: animate ? `${ripple} 0.6s linear` : 'none',
  pointerEvents: 'none',
}));

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  glowColor,
  pulseAnimation,
  rippleEffect = true,
  borderAnimation,
  onClick,
  sx,
  textColor,
  ...buttonProps
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [rippleId, setRippleId] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleEffect) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple = { id: rippleId, x, y };
      setRipples(prev => [...prev, newRipple]);
      setRippleId(prev => prev + 1);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <NeonButtonContainer
        glowColor={glowColor}
        pulseAnimation={pulseAnimation}
        borderAnimation={borderAnimation}
        textColor={textColor}
        onClick={handleClick}
        sx={{
          position: 'relative',
          ...sx,
        }}
        {...buttonProps}
      >
        {children}
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <RippleEffect
            key={ripple.id}
            animate={true}
            sx={{
              left: ripple.x - 2,
              top: ripple.y - 2,
              width: 4,
              height: 4,
            }}
          />
        ))}

        {/* Corner indicators */}
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 6,
            height: 6,
            background: glowColor || colors.neonCyan,
            borderRadius: '50%',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 6,
            height: 6,
            background: glowColor || colors.neonCyan,
            borderRadius: '50%',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
      </NeonButtonContainer>
    </motion.div>
  );
};

export default NeonButton;