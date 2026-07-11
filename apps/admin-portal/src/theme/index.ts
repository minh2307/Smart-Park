import { createTheme, Theme } from '@mui/material/styles';
import { palette, darkPaletteOverrides } from './palette';
import { typography } from './typography';
import { shadows, darkShadows } from './shadows';
import { spacing } from './spacing';
import { components } from './components';

export const getAppTheme = (mode: 'light' | 'dark'): Theme => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      ...palette,
      mode,
      ...(isDark && {
        primary: palette.primary,
        secondary: palette.secondary,
        error: palette.error,
        warning: palette.warning,
        info: palette.info,
        success: palette.success,
        ...darkPaletteOverrides,
      }),
      ...(!isDark && {
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
      }),
    },
    typography,
    shadows: isDark ? darkShadows : shadows,
    spacing,
    shape: {
      borderRadius: 10,  // Global default border-radius
    },
    components,
  });
};
