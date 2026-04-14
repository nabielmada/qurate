/**
 * Base URL for the Qurate backend API.
 * Uses NEXT_PUBLIC_API_URL from environment, defaults to localhost for development.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

/**
 * Helper to build API URL paths
 */
export function apiUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}
