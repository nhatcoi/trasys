'use client';

import { IconButton, Tooltip } from '@mui/material';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';

export function ThemeToggle() {
  // MUI theme is currently fixed to light mode
  // This component is kept for future dark mode implementation
  
  return (
    <Tooltip title="Light mode">
      <IconButton color="inherit">
        <LightModeIcon />
      </IconButton>
    </Tooltip>
  );
}
