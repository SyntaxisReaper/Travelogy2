import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { colors } from '../styles/techTheme';

interface MatrixRainProps {
  opacity?: number;
  speed?: number;
  density?: number;
}

const MatrixRainBase: React.FC<MatrixRainProps> = ({ 
  opacity = 0.1, 
  speed = 50, 
  density = 20 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters (mix of katakana, digits, and symbols)
    const matrixChars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;':\",./<>?";
    const chars = matrixChars.split('');

    const fontSize = 20;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to store the y position of each drop
    const drops: number[] = [];
    
    // Initialize drops
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100;
    }

    // Drawing the characters
    const draw = () => {
      // Create fade effect
      ctx.fillStyle = `rgba(15, 15, 35, ${0.1})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = colors.matrixGreen;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      // Loop through drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Remove glow effect for better performance
        ctx.shadowBlur = 0;
        
        // Draw character
        ctx.fillText(char, i * fontSize + fontSize / 2, drops[i] * fontSize);
        
        // Reset drop to top randomly after reaching bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        
        // Increment y coordinate
        drops[i]++;
      }
    };

    const intervalId = setInterval(draw, speed);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [speed, density]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

const MatrixRain: React.FC<MatrixRainProps> = React.memo(MatrixRainBase);
MatrixRain.displayName = 'MatrixRain';

export default MatrixRain;
