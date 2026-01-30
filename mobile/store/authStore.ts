import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/config/api';

interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens securely
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  },

  register: async (email: string, password: string, username?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Registration failed');
    }

    const data = await response.json();
    
    // Store tokens securely
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (!accessToken) {
        set({ isLoading: false });
        return;
      }

      // Verify token by fetching user
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        set({
          user: data.user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (refreshToken) {
        // Try to refresh
        await get().refreshTokens();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  refreshTokens: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (!refreshToken) {
        set({ isLoading: false });
        return;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        
        // Fetch user with new token
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          set({
            user: userData.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        await get().logout();
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      set({ isLoading: false });
    }
  },
}));
