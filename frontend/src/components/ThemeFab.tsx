import React from 'react';
import { Fab } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

interface ThemeFabProps {
  onClick: () => void;
}

const ThemeFab: React.FC<ThemeFabProps> = ({ onClick }) => {
  return (
    <Fab color="secondary" aria-label="theme" onClick={onClick} sx={{ position: 'fixed', bottom: 24, right: 92, zIndex: 1200 }}>
      <PaletteIcon />
    </Fab>
  );
};

export default ThemeFab;
