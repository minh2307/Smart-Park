import { createTheme, Theme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  const palette = mode === 'light' ? lightPalette : darkPalette;
  const primaryMain = (palette.primary as any)?.main || '#0d9488';
  const primaryLight = (palette.primary as any)?.light || '#2dd4bf';
  const primaryDark = (palette.primary as any)?.dark || '#0f766e';

  return createTheme({
    palette,
    typography,
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 22px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryLight} 100%)`,
            color: '#ffffff',
            '&:hover': {
              background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0px 4px 20px rgba(0, 0, 0, 0.05)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export * from './palette';
export * from './typography';
