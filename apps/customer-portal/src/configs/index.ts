export const config = {
  appName: import.meta.env.VITE_APP_NAME || 'Smart Park Customer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  googleMapKey: import.meta.env.VITE_GOOGLE_MAP_KEY || '',
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true' || import.meta.env.DEV,
} as const;

export type AppConfig = typeof config;
