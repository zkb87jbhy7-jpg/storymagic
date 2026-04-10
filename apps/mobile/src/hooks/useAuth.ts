import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, UserCreate } from 'shared-types';
import * as api from '../services/api';
import * as authService from '../services/auth';

// ─── Auth Hook ───
// Provides authentication state and methods to the entire app.

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const hasToken = await authService.isAuthenticated();
        if (!hasToken) {
          if (mounted) setIsLoading(false);
          return;
        }

        // Try to load cached user first for fast startup
        const cachedUser = await authService.getUserData<User>();
        if (cachedUser && mounted) {
          setUser(cachedUser);
        }

        // Validate token against the server
        const serverUser = await api.getProfile();
        if (mounted) {
          setUser(serverUser);
          await authService.storeUserData(serverUser);
        }
      } catch {
        // Token is invalid or expired -- clear and show login
        await authService.clearTokens();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login({ email, password });
      await authService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
      });
      await authService.storeUserData(response.user);
      setUser(response.user);
    } catch (err) {
      const message =
        err instanceof api.ApiError
          ? err.message
          : 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.register(data);
      await authService.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
      });
      await authService.storeUserData(response.user);
      setUser(response.user);
    } catch (err) {
      const message =
        err instanceof api.ApiError
          ? err.message
          : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, register, logout, clearError],
  );
}
