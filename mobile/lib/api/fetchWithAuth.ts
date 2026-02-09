import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';

/**
 * Authenticated fetch helper with automatic 401 retry.
 * Uses the auth store to attach Bearer token and refresh on expiry.
 */
export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken, refreshTokens } = useAuthStore.getState();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    try {
      await refreshTokens();
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        return fetch(`${API_URL}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
        });
      }
    } catch {
      // Refresh failed, return original 401 response
    }
  }

  return response;
}
