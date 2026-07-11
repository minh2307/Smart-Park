import { Shadows } from '@mui/material/styles';

/**
 * Smart Park — Tinted shadows
 * Light mode: blue-gray tint (slate-700 hue)
 * Each level progressively larger and softer
 * No harsh black shadows — matches warm neutral palette
 */
export const shadows: Shadows = [
  'none',
  // 1: Subtle card resting state
  '0px 1px 2px rgba(30, 41, 59, 0.04), 0px 1px 3px rgba(30, 41, 59, 0.06)',
  // 2: Hover card
  '0px 2px 4px rgba(30, 41, 59, 0.05), 0px 1px 6px rgba(30, 41, 59, 0.06)',
  // 3: Elevated card
  '0px 4px 8px -2px rgba(30, 41, 59, 0.06), 0px 2px 4px -2px rgba(30, 41, 59, 0.04)',
  // 4: Floating element
  '0px 8px 16px -4px rgba(30, 41, 59, 0.08), 0px 4px 6px -2px rgba(30, 41, 59, 0.04)',
  // 5: Modal / dropdown
  '0px 16px 32px -8px rgba(30, 41, 59, 0.10), 0px 8px 16px -4px rgba(30, 41, 59, 0.06)',
  // 6: Top-level overlay
  '0px 24px 48px -12px rgba(30, 41, 59, 0.12), 0px 12px 24px -6px rgba(30, 41, 59, 0.06)',
  ...Array(18).fill('0px 24px 48px -12px rgba(30, 41, 59, 0.12), 0px 12px 24px -6px rgba(30, 41, 59, 0.06)')
] as unknown as Shadows;

/**
 * Dark mode shadows — tinted with dark blue
 */
export const darkShadows: Shadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.2), 0px 1px 3px rgba(0, 0, 0, 0.12)',
  '0px 2px 4px rgba(0, 0, 0, 0.22), 0px 1px 6px rgba(0, 0, 0, 0.14)',
  '0px 4px 8px -2px rgba(0, 0, 0, 0.24), 0px 2px 4px -2px rgba(0, 0, 0, 0.12)',
  '0px 8px 16px -4px rgba(0, 0, 0, 0.28), 0px 4px 6px -2px rgba(0, 0, 0, 0.14)',
  '0px 16px 32px -8px rgba(0, 0, 0, 0.32), 0px 8px 16px -4px rgba(0, 0, 0, 0.18)',
  '0px 24px 48px -12px rgba(0, 0, 0, 0.36), 0px 12px 24px -6px rgba(0, 0, 0, 0.20)',
  ...Array(18).fill('0px 24px 48px -12px rgba(0, 0, 0, 0.36), 0px 12px 24px -6px rgba(0, 0, 0, 0.20)')
] as unknown as Shadows;
