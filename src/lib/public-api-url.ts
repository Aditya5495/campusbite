/**
 * Express API base URL for browser fetches. NEXT_PUBLIC_* is inlined at build time;
 * fallback matches local server default when env is missing (avoids broken relative URLs).
 */
export const PUBLIC_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004'
).replace(/\/$/, '');
