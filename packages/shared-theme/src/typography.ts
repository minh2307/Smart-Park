import { ThemeOptions } from '@mui/material/styles';

export const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Outfit',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '2.5rem', // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '2rem', // 32px
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.75rem', // 28px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.5rem', // 24px
    fontWeight: 500,
    lineHeight: 1.35,
  },
  h5: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1.25rem', // 20px
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '1rem', // 16px
    fontWeight: 500,
    lineHeight: 1.45,
  },
  body1: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
  },
  body2: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57,
  },
  button: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    textTransform: 'none',
  },
  caption: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.75rem', // 12px
    lineHeight: 1.66,
  },
};
