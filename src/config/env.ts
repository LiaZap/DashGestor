export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  metaAppId: import.meta.env.VITE_META_APP_ID || '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
