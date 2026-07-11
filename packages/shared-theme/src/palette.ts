import { PaletteOptions } from '@mui/material/styles';

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#0d9488', // Emerald Teal
    light: '#2dd4bf',
    dark: '#0f766e',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f59e0b', // Warm Amber
    light: '#fbbf24',
    dark: '#b45309',
    contrastText: '#0f172a',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
  },
  divider: '#e2e8f0',
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#0d9488', // Emerald Teal
    light: '#2dd4bf',
    dark: '#0f766e',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f59e0b', // Warm Amber
    light: '#fbbf24',
    dark: '#b45309',
    contrastText: '#0f172a',
  },
  background: {
    default: '#0c1222',
    paper: '#1e293b',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    disabled: '#64748b',
  },
  divider: '#334155',
};
