import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuthToken, getUserId, clearAllAuth, setAuthToken, setUserId } from '@/utils/storage';
import { login as loginApi, logout as logoutApi, LoginCredentials } from '@/services/auth';
import { getProfile } from '@/services/profile';
import { Profile, AuthResponse } from '@/types';

interface AuthState {
  user: Profile | null;
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    userId: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from secure storage
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const [token, userId] = await Promise.all([getAuthToken(), getUserId()]);

        if (token && userId) {
          // Try to fetch user profile
          try {
            const profile = await getProfile();
            setState({
              user: profile,
              token,
              userId,
              isLoading: false,
              isAuthenticated: true,
            });
          } catch (error) {
            // Token might be expired, clear auth
            await clearAllAuth();
            setState({
              user: null,
              token: null,
              userId: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          setState({
            user: null,
            token: null,
            userId: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch {
        setState({
          user: null,
          token: null,
          userId: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }

    loadStoredAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await loginApi(credentials);

      // Fetch user profile after login
      let profile: Profile | null = null;
      try {
        profile = await getProfile();
      } catch {
        // getProfile may have failed with 401, and the interceptor clears auth.
        // Re-store tokens from the successful login so the session isn't lost.
        await setAuthToken(response.token);
        await setUserId(response.userId);
      }

      setState({
        user: profile,
        token: response.token,
        userId: response.userId,
        isLoading: false,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await logoutApi();
    } finally {
      setState({
        user: null,
        token: null,
        userId: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.token) return;

    try {
      const profile = await getProfile();
      setState((prev) => ({ ...prev, user: profile }));
    } catch {
      // Profile refresh failed (e.g. network); keep existing state
    }
  }, [state.token]);

  // Auto-retry profile fetch when authenticated but profile is missing
  useEffect(() => {
    if (state.isAuthenticated && !state.user && state.token && !state.isLoading) {
      const timer = setTimeout(() => {
        refreshUser();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isAuthenticated, state.user, state.token, state.isLoading, refreshUser]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
