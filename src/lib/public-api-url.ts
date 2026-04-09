/**
 * Express API base URL for browser fetches. NEXT_PUBLIC_* is inlined at build time;
 * fallback uses local server only on localhost, otherwise same-origin.
 */
const runtimeDefaultApiUrl =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin
    : 'http://localhost:5004';

export const PUBLIC_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || runtimeDefaultApiUrl
).replace(/\/$/, '');
