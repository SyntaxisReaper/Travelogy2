import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../styles/techTheme';

interface TechLoaderProps {
  type?: 'circuit' | 'matrix' | 'dna' | 'quantum' | 'neural';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: string;
  fullscreen?: boolean;
}

// Circuit animation
const circuitPulse = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

const dataFlow = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100px); opacity: 0; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { 
    box-shadow: 0 0 10px ${colors.neonCyan};
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 30px ${colors.neonCyan}, 0 0 60px ${colors.neonCyan};
    transform: scale(1.05);
  }
  100% { 
    box-shadow: 0 0 10px ${colors.neonCyan};
    transform: scale(1);
  }
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
    background: `
      radial-gradient(ellipse at center, ${colors.deepSpace} 0%, ${colors.darkBg} 100%)
    `,
    zIndex: 9999,
  }),
}));

const CircuitLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    let animationId: number;
    let time = 0;

    const drawCircuit = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;

      // Draw circuit lines
      const lines = [
        { x1: 20, y1: centerY, x2: size - 20, y2: centerY },
        { x1: centerX, y1: 20, x2: centerX, y2: size - 20 },
        { x1: 20, y1: 20, x2: size - 20, y2: size - 20 },
        { x1: size - 20, y1: 20, x2: 20, y2: size - 20 },
      ];

      lines.forEach((line, index) => {
        const opacity = 0.5 + 0.5 * Math.sin(time * 0.01 + index * Math.PI / 2);
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });

      // Draw nodes
      const nodes = [
        { x: centerX, y: centerY },
        { x: 30, y: 30 },
        { x: size - 30, y: 30 },
        { x: 30, y: size - 30 },
        { x: size - 30, y: size - 30 },
      ];

      nodes.forEach((node, index) => {
        const scale = 1 + 0.3 * Math.sin(time * 0.008 + index * Math.PI / 3);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(drawCircuit);
    };

    drawCircuit();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [size, color]);

  return (
    <Box
      sx={{
        position: 'relative',
        animation: `${rotate} 3s linear infinite, ${pulse} 2s ease-in-out infinite`,
      }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
};

const MatrixLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
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
            width: '2px',
            height: size,
            background: `linear-gradient(
              180deg,
              transparent,
              ${color},
              transparent
            )`,
            animation: `${dataFlow} ${1 + i * 0.2}s linear infinite`,
            animationDelay: `${i * 0.1}s`,
            left: `${12 + i * 10}%`,
          }}
        />
      ))}
    </Box>
  );
};

const DNALoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
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
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: color,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${color}`,
            animation: `${rotate} 2s linear infinite`,
            animationDelay: `${i * 0.1}s`,
            transformOrigin: `${size / 2}px 0px`,
            top: '50%',
            left: '50%',
            transform: `rotate(${i * 30}deg) translateY(-${size / 3}px)`,
          }}
        />
      ))}
    </Box>
  );
};

const QuantumLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
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
      {[...Array(3)].map((_, ring) => (
        <Box
          key={ring}
          sx={{
            position: 'absolute',
            width: size - ring * 20,
            height: size - ring * 20,
            border: `2px solid ${color}`,
            borderRadius: '50%',
            borderTop: 'transparent',
            borderRight: ring % 2 === 0 ? 'transparent' : undefined,
            animation: `${rotate} ${2 + ring * 0.5}s linear infinite ${ring % 2 === 0 ? 'reverse' : ''}`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          width: 8,
          height: 8,
          background: color,
          borderRadius: '50%',
          boxShadow: `0 0 20px ${color}`,
          animation: `${pulse} 1s ease-in-out infinite`,
        }}
      />
    </Box>
  );
};

const NeuralLoader: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '4px',
        padding: '10px',
      }}
    >
      {[...Array(16)].map((_, i) => (
        <Box
          key={i}
          sx={{
            background: color,
            borderRadius: '2px',
            opacity: 0.3,
            animation: `${circuitPulse} ${1 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            boxShadow: `0 0 5px ${color}`,
          }}
        />
      ))}
    </Box>
  );
};

const TechLoader: React.FC<TechLoaderProps> = ({
  type = 'circuit',
  size = 'medium',
  text = 'Loading...',
  color = colors.neonCyan,
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
      case 'circuit':
        return <CircuitLoader size={loaderSize} color={color} />;
      case 'matrix':
        return <MatrixLoader size={loaderSize} color={color} />;
      case 'dna':
        return <DNALoader size={loaderSize} color={color} />;
      case 'quantum':
        return <QuantumLoader size={loaderSize} color={color} />;
      case 'neural':
        return <NeuralLoader size={loaderSize} color={color} />;
      default:
        return <CircuitLoader size={loaderSize} color={color} />;
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
              fontFamily: '"Orbitron", monospace',
              letterSpacing: '0.1em',
              textShadow: `0 0 10px ${color}`,
              animation: `${circuitPulse} 2s ease-in-out infinite`,
            }}
          >
            {text}
          </Typography>
        </motion.div>
      )}

      {/* Progress indicator dots */}
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
              animation: `${pulse} 1s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        ))}
      </Box>
    </LoaderContainer>
  );
};

export default TechLoader;