export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sp_access_token',
  REFRESH_TOKEN: 'sp_refresh_token',
  THEME_MODE: 'sp_theme_mode',
} as const;

export const REGEX = {
  PHONE: /^(0[3|5|7|8|9])+([0-9]{8})$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
} as const;

export const API_PREFIX = '/api/v1';

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;
