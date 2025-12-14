import React, { useState, useEffect } from 'react';
import { Box, Typography, TypographyProps } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { colors } from '../styles/techTheme';

interface GlitchTextProps extends TypographyProps {
  text: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  autoGlitch?: boolean;
  trigger?: boolean;
}

const glitchAnim1 = keyframes`
  0% {
    clip: rect(42px, 9999px, 44px, 0);
    transform: skew(0.85deg);
  }
  5% {
    clip: rect(12px, 9999px, 59px, 0);
    transform: skew(0.40deg);
  }
  10% {
    clip: rect(48px, 9999px, 29px, 0);
    transform: skew(0.81deg);
  }
  15% {
    clip: rect(42px, 9999px, 73px, 0);
    transform: skew(0.05deg);
  }
  20% {
    clip: rect(63px, 9999px, 27px, 0);
    transform: skew(0.18deg);
  }
  25% {
    clip: rect(34px, 9999px, 55px, 0);
    transform: skew(0.93deg);
  }
  30% {
    clip: rect(86px, 9999px, 73px, 0);
    transform: skew(0.82deg);
  }
  35% {
    clip: rect(2px, 9999px, 40px, 0);
    transform: skew(0.61deg);
  }
  40% {
    clip: rect(43px, 9999px, 81px, 0);
    transform: skew(0.40deg);
  }
  45% {
    clip: rect(34px, 9999px, 2px, 0);
    transform: skew(0.80deg);
  }
  50% {
    clip: rect(81px, 9999px, 44px, 0);
    transform: skew(0.61deg);
  }
  55% {
    clip: rect(30px, 9999px, 73px, 0);
    transform: skew(0.96deg);
  }
  60% {
    clip: rect(65px, 9999px, 42px, 0);
    transform: skew(0.58deg);
  }
  65% {
    clip: rect(40px, 9999px, 72px, 0);
    transform: skew(0.28deg);
  }
  70% {
    clip: rect(32px, 9999px, 54px, 0);
    transform: skew(0.35deg);
  }
  75% {
    clip: rect(22px, 9999px, 20px, 0);
    transform: skew(0.87deg);
  }
  80% {
    clip: rect(30px, 9999px, 75px, 0);
    transform: skew(0.38deg);
  }
  85% {
    clip: rect(57px, 9999px, 52px, 0);
    transform: skew(0.06deg);
  }
  90% {
    clip: rect(83px, 9999px, 40px, 0);
    transform: skew(0.15deg);
  }
  95% {
    clip: rect(37px, 9999px, 2px, 0);
    transform: skew(0.69deg);
  }
  100% {
    clip: rect(4px, 9999px, 91px, 0);
    transform: skew(0.60deg);
  }
`;

const glitchAnim2 = keyframes`
  0% {
    clip: rect(65px, 9999px, 100px, 0);
    transform: skew(0.30deg);
  }
  5% {
    clip: rect(52px, 9999px, 74px, 0);
    transform: skew(0.44deg);
  }
  10% {
    clip: rect(79px, 9999px, 85px, 0);
    transform: skew(0.13deg);
  }
  15% {
    clip: rect(75px, 9999px, 5px, 0);
    transform: skew(0.21deg);
  }
  20% {
    clip: rect(67px, 9999px, 61px, 0);
    transform: skew(0.7deg);
  }
  25% {
    clip: rect(14px, 9999px, 79px, 0);
    transform: skew(0.3deg);
  }
  30% {
    clip: rect(1px, 9999px, 66px, 0);
    transform: skew(0.58deg);
  }
  35% {
    clip: rect(86px, 9999px, 30px, 0);
    transform: skew(0.84deg);
  }
  40% {
    clip: rect(23px, 9999px, 98px, 0);
    transform: skew(0.55deg);
  }
  45% {
    clip: rect(85px, 9999px, 72px, 0);
    transform: skew(0.19deg);
  }
  50% {
    clip: rect(39px, 9999px, 49px, 0);
    transform: skew(0.52deg);
  }
  55% {
    clip: rect(59px, 9999px, 42px, 0);
    transform: skew(0.72deg);
  }
  60% {
    clip: rect(16px, 9999px, 94px, 0);
    transform: skew(0.91deg);
  }
  65% {
    clip: rect(29px, 9999px, 88px, 0);
    transform: skew(0.34deg);
  }
  70% {
    clip: rect(77px, 9999px, 27px, 0);
    transform: skew(0.45deg);
  }
  75% {
    clip: rect(69px, 9999px, 73px, 0);
    transform: skew(0.96deg);
  }
  80% {
    clip: rect(42px, 9999px, 39px, 0);
    transform: skew(0.78deg);
  }
  85% {
    clip: rect(87px, 9999px, 6px, 0);
    transform: skew(0.25deg);
  }
  90% {
    clip: rect(33px, 9999px, 15px, 0);
    transform: skew(0.88deg);
  }
  95% {
    clip: rect(71px, 9999px, 85px, 0);
    transform: skew(0.10deg);
  }
  100% {
    clip: rect(59px, 9999px, 12px, 0);
    transform: skew(0.17deg);
  }
`;

const GlitchContainer = styled(Box, {
  shouldForwardProp: (prop) => !['glitching', 'intensity'].includes(prop as string),
})<{ glitching: boolean; intensity: string }>(
  ({ theme, glitching, intensity }) => {
    const duration = intensity === 'low' ? '2s' : intensity === 'medium' ? '1s' : '0.5s';
    
    return {
      position: 'relative',
      display: 'inline-block',
      '&::before, &::after': glitching
        ? {
            content: 'attr(data-text)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
          }
        : {
            content: 'none',
            display: 'none',
          },
      '&::before': glitching
        ? {
            animation: `${glitchAnim1} ${duration} infinite linear alternate-reverse`,
            color: colors.glitchRed,
            zIndex: -1,
            textShadow: `2px 0 ${colors.glitchRed}`,
            clipPath: 'inset(0)',
          }
        : {},
      '&::after': glitching
        ? {
            animation: `${glitchAnim2} ${duration} infinite linear alternate-reverse`,
            color: colors.neonCyan,
            zIndex: -2,
            textShadow: `-2px 0 ${colors.neonCyan}`,
            clipPath: 'inset(0)',
          }
        : {},
      '& .glitch-text': {
        position: 'relative',
        zIndex: 1,
        animation: glitching ? `glitch ${duration} infinite` : 'none',
        textShadow: glitching 
          ? `
            0 0 5px ${colors.neonCyan},
            2px 0 0 ${colors.glitchRed},
            -2px 0 0 ${colors.neonCyan}
          `
          : `0 0 10px ${colors.neonCyan}`,
        willChange: 'transform, filter',
      },
    };
  }
);

const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  glitchIntensity = 'medium',
  autoGlitch = false,
  trigger = false,
  sx,
  ...typographyProps
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsGlitching(true);
      const timeout = setTimeout(() => {
        setIsGlitching(false);
      }, glitchIntensity === 'low' ? 2000 : glitchIntensity === 'medium' ? 1000 : 500);
      
      return () => clearTimeout(timeout);
    }
  }, [trigger, glitchIntensity]);

  useEffect(() => {
    if (autoGlitch) {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
        }, glitchIntensity === 'low' ? 500 : glitchIntensity === 'medium' ? 300 : 200);
      }, Math.random() * 5000 + 2000); // Random interval between 2-7 seconds

      return () => clearInterval(interval);
    }
  }, [autoGlitch, glitchIntensity]);

  return (
    <GlitchContainer
      data-text={text}
      glitching={isGlitching}
      intensity={glitchIntensity}
      sx={sx}
    >
      <Typography
        className="glitch-text"
        sx={{
          background: `linear-gradient(45deg, ${colors.neonCyan}, ${colors.neonPink})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          ...(sx || {}),
        }}
        {...(typographyProps as any)}
      >
        {text}
      </Typography>
    </GlitchContainer>
  );
};

export default GlitchText;