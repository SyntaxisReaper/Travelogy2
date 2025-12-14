import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

interface TypewriterTextProps {
  lines: string[];
  typingSpeedMs?: number;
  pauseMs?: number;
  variant?: any;
  color?: string;
  loop?: boolean;
  sx?: any;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  lines,
  typingSpeedMs = 40,
  pauseMs = 1200,
  variant = 'h5',
  color,
  loop = true,
  sx,
}) => {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = lines[index] || '';
    let timer: any;

    if (!deleting && display.length < full.length) {
      timer = setTimeout(() => setDisplay(full.slice(0, display.length + 1)), typingSpeedMs);
    } else if (deleting && display.length > 0) {
      timer = setTimeout(() => setDisplay(full.slice(0, display.length - 1)), Math.max(typingSpeedMs / 2, 20));
    } else {
      timer = setTimeout(() => {
        if (!deleting) {
          setDeleting(true);
        } else {
          setDeleting(false);
          setDisplay('');
          const next = index + 1;
          if (next < lines.length) setIndex(next);
          else if (loop) setIndex(0);
        }
      }, pauseMs);
    }

    return () => clearTimeout(timer);
  }, [display, deleting, index, lines, typingSpeedMs, pauseMs, loop]);

  useEffect(() => {
    // reset when index changes
    setDisplay('');
    setDeleting(false);
  }, [index]);

  return (
    <Typography variant={variant} sx={sx} style={{ color }}>
      {display}
      <span style={{ borderRight: '2px solid currentColor', marginLeft: 2 }} />
    </Typography>
  );
};

export default TypewriterText;
