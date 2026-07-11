import { PaletteOptions } from '@mui/material/styles';

/**
 * Smart Park — Refined enterprise palette
 * Single accent: Teal (#0d9488 / teal-600 family)
 * Warm-tinted neutrals — no pure black, no clashing secondary
 */
export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#0d9488',      // Teal-600 — confident, professional, not generic blue
    light: '#ccfbf1',     // Teal-100 — subtle background tint
    dark: '#0f766e',      // Teal-700 — hover/pressed states
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#64748b',      // Slate-500 — neutral secondary, no competing accent
    light: '#f1f5f9',     // Slate-100
    dark: '#475569',      // Slate-600
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',      // Slightly warmer red
    light: '#fef2f2',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',      // Amber-500 — warm, readable
    light: '#fffbeb',
    dark: '#d97706',
  },
  info: {
    main: '#3b82f6',      // Blue-500 — informational only, not primary
    light: '#eff6ff',
    dark: '#2563eb',
  },
  success: {
    main: '#22c55e',      // Green-500
    light: '#f0fdf4',
    dark: '#16a34a',
  },
  text: {
    primary: '#1e293b',   // Slate-800 — warm dark, not pure black
    secondary: '#64748b', // Slate-500 — comfortable reading
  },
  divider: 'rgba(148, 163, 184, 0.2)', // Slate-400 @ 20% — soft divider
  background: {
    default: '#f8fafc',   // Slate-50 — warm off-white
    paper: '#ffffff',
  },
  action: {
    hover: 'rgba(13, 148, 136, 0.04)',    // Teal-tinted hover
    selected: 'rgba(13, 148, 136, 0.08)', // Teal-tinted selected
    focus: 'rgba(13, 148, 136, 0.12)',     // Teal-tinted focus
  },
};

/**
 * Dark mode specific overrides — applied in theme/index.ts
 */
export const darkPaletteOverrides = {
  background: {
    default: '#0c1222',   // Deep navy-black — not pure #121212
    paper: '#141c2e',     // Navy-dark — warm depth
  },
  text: {
    primary: '#e2e8f0',   // Slate-200 — soft white
    secondary: '#94a3b8', // Slate-400
  },
  divider: 'rgba(148, 163, 184, 0.12)', // Subtle in dark mode
  action: {
    hover: 'rgba(13, 148, 136, 0.08)',
    selected: 'rgba(13, 148, 136, 0.12)',
    focus: 'rgba(13, 148, 136, 0.16)',
  },
};
