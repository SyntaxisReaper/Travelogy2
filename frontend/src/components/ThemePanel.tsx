import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from '@mui/material';

interface ThemePanelProps {
  open: boolean;
  onClose: () => void;
  themeMode: 'light' | 'dark';
  themeFont: 'tech' | 'system' | 'mono' | 'grotesk';
  onChangeThemeMode: (m: 'light' | 'dark') => void;
  onChangeThemeFont: (f: 'tech' | 'system' | 'mono' | 'grotesk') => void;
}

const FONTS: ThemePanelProps['themeFont'][] = ['tech','system','mono','grotesk'];

const ThemePanel: React.FC<ThemePanelProps> = ({ open, onClose, themeMode, themeFont, onChangeThemeMode, onChangeThemeFont }) => {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Customize Theme</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Mode</Typography>
            <ToggleButtonGroup exclusive value={themeMode} onChange={(_, v) => v && onChangeThemeMode(v)} size="small">
              <ToggleButton value="dark">Dark</ToggleButton>
              <ToggleButton value="light">Light</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Font</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {FONTS.map((f) => (
                <Chip key={f} label={f} color={themeFont===f? 'primary' : 'default'} onClick={() => onChangeThemeFont(f)} />
              ))}
            </Stack>
            <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>Preview Heading</Typography>
              <Typography variant="body1">The quick brown fox jumps over the lazy dog 1234567890</Typography>
            </Box>
          </Box>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemePanel;