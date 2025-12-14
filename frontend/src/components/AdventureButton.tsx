import React, { useState } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { travelColors, travelStyles } from '../styles/travelTheme';

interface AdventureButtonProps extends Omit<ButtonProps, 'variant'> {
  buttonVariant?: 'ocean' | 'sunset' | 'forest' | 'coral';
  adventure?: boolean;
  rippleEffect?: boolean;
}

const gentleGlow = keyframes`
  0% {
    box-shadow: 0 4px 12px rgba(46, 134, 171, 0.2);
  }
  50% {
    box-shadow: 0 6px 20px rgba(46, 134, 171, 0.3);
  }
  100% {
    box-shadow: 0 4px 12px rgba(46, 134, 171, 0.2);
  }
`;

const adventureShimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
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

const sparkleExplode = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
`;

const adventureBurst = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(241, 143, 1, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(241, 143, 1, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(241, 143, 1, 0);
  }
`;

const getVariantStyles = (buttonVariant: string) => {
  switch (buttonVariant) {
    case 'sunset':
      return {
        background: travelColors.gradients.sunset,
        color: travelColors.text.white,
        '&:hover': {
          background: `linear-gradient(135deg, #FF6B6B 0%, #F18F01 30%, #FFE66D 100%)`,
          boxShadow: travelColors.shadows.warm,
        },
      };
    case 'forest':
      return {
        background: travelColors.gradients.forest,
        color: travelColors.text.white,
        '&:hover': {
          background: `linear-gradient(135deg, #4A7A59 0%, #8BC34A 80%)`,
          boxShadow: `0 6px 20px rgba(74, 122, 89, 0.3)`,
        },
      };
    case 'coral':
      return {
        background: `linear-gradient(135deg, ${travelColors.primary.coral} 0%, ${travelColors.primary.sunset} 100%)`,
        color: travelColors.text.white,
        '&:hover': {
          background: `linear-gradient(135deg, #FF6B6B 0%, #F18F01 80%)`,
          boxShadow: `0 6px 20px rgba(255, 107, 107, 0.3)`,
        },
      };
    default: // ocean
      return {
        background: travelColors.gradients.ocean,
        color: travelColors.text.white,
        '&:hover': {
          background: `linear-gradient(135deg, #2E86AB 0%, #87CEEB 80%)`,
          boxShadow: travelColors.shadows.medium,
        },
      };
  }
};

const AdventureButtonContainer = styled(Button)(() => ({
    position: 'relative',
    padding: '12px 32px',
    borderRadius: travelStyles.borderRadius.medium,
    fontFamily: travelStyles.fonts.primary,
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'none',
    border: 'none',
    overflow: 'hidden',
    transition: travelStyles.transitions.medium,
    background: travelColors.gradients.ocean,
    color: travelColors.text.white,

    '&:hover': {
      background: `linear-gradient(135deg, #2E86AB 0%, #87CEEB 80%)`,
      boxShadow: travelColors.shadows.medium,
      transform: 'translateY(-2px) scale(1.02)',
    },

    '&:active': {
      transform: 'translateY(1px)',
    },

    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      '&:hover': {
        transform: 'none',
      },
    },

    // Subtle shine effect
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
      transition: 'left 0.6s ease',
      zIndex: 1,
    },

    '&:hover::before': {
      left: '100%',
    },


    // Content should be above overlays
    '& .MuiButton-startIcon, & .MuiButton-endIcon, & span': {
      position: 'relative',
      zIndex: 2,
    },
  })
);

const RippleEffect = styled('span')<{ animate: boolean }>(({ animate }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.4)',
  transform: 'scale(0)',
  animation: animate ? `${ripple} 0.6s linear` : 'none',
  pointerEvents: 'none',
}));

const SparkleEffect = styled('span')<{ animate: boolean }>(({ animate }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  background: `radial-gradient(circle, ${travelColors.primary.sunset}, ${travelColors.primary.coral})`,
  borderRadius: '50%',
  transform: 'scale(0)',
  animation: animate ? `${sparkleExplode} 1s ease-out` : 'none',
  pointerEvents: 'none',
  boxShadow: `0 0 6px ${travelColors.primary.sunset}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: `linear-gradient(45deg, ${travelColors.primary.sunset}, transparent, ${travelColors.primary.coral}, transparent)`,
    borderRadius: '50%',
    animation: animate ? 'spin 0.8s linear infinite' : 'none',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));

const AdventureButton: React.FC<AdventureButtonProps> = ({
  children,
  buttonVariant,
  adventure,
  rippleEffect = true,
  onClick,
  sx,
  ...buttonProps
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [rippleId, setRippleId] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Adventure click effect
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 300);
    
    // Create multiple sparkles around click point
    if (adventure) {
      const newSparkles: Array<{ id: number; x: number; y: number }> = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45) * (Math.PI / 180);
        const distance = 30 + Math.random() * 20;
        newSparkles.push({
          id: rippleId + i,
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
        });
      }
      setSparkles(prev => [...prev, ...newSparkles]);
      
      // Remove sparkles after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
      }, 1000);
    }
    
    if (rippleEffect) {
      const newRipple = { id: rippleId + 100, x, y };
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
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        rotateX: adventure ? 5 : 0,
      }}
      whileTap={{ 
        scale: 0.95,
        rotateX: 0,
      }}
      animate={{
        rotateY: isClicking ? 10 : 0,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: adventure ? 500 : 400, 
        damping: adventure ? 25 : 17,
      }}
      style={{ perspective: '1000px' }}
    >
      <AdventureButtonContainer
        onClick={handleClick}
        sx={{
          position: 'relative',
          ...getVariantStyles(buttonVariant || 'ocean'),
          ...(adventure && {
            animation: `${gentleGlow} 2s ease-in-out infinite`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, transparent, ${travelColors.primary.sunset}20, transparent)`,
              borderRadius: 'inherit',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            },
            '&:hover::before': {
              opacity: 1,
              animation: `${adventureShimmer} 1s ease-in-out infinite`,
            },
          }),
          ...(isClicking && {
            animation: `${adventureBurst} 0.3s ease-out`,
          }),
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
        
        {/* Adventure sparkle effects */}
        {sparkles.map(sparkle => (
          <SparkleEffect
            key={sparkle.id}
            animate={true}
            sx={{
              left: sparkle.x - 4,
              top: sparkle.y - 4,
            }}
          />
        ))}
        
        {/* Adventure floating particles when adventure mode */}
        {adventure && (
          <>
            <motion.div
              animate={{
                y: [-2, -8, -2],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: -5,
                right: 10,
                width: 4,
                height: 4,
                background: travelColors.primary.sunset,
                borderRadius: '50%',
                boxShadow: `0 0 4px ${travelColors.primary.sunset}`,
                pointerEvents: 'none',
              }}
            />
            <motion.div
              animate={{
                y: [-3, -10, -3],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              style={{
                position: 'absolute',
                top: -3,
                left: 8,
                width: 3,
                height: 3,
                background: travelColors.primary.coral,
                borderRadius: '50%',
                boxShadow: `0 0 3px ${travelColors.primary.coral}`,
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </AdventureButtonContainer>
    </motion.div>
  );
};

export default AdventureButton;