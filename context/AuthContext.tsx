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
    let isMounted = true;

    async function loadStoredAuth() {
      try {
        // Wrapped in try-catch to handle SecureStore errors in release builds
        let token: string | null = null;
        let userId: string | null = null;
        
        try {
          [token, userId] = await Promise.all([getAuthToken(), getUserId()]);
        } catch (storageError) {
          console.warn('[Auth] Failed to read from secure storage:', storageError);
          // Continue with null values - user will need to log in again
        }

        if (!isMounted) return;

        if (token && userId) {
          // Try to fetch user profile
          try {
            const profile = await getProfile();
            if (!isMounted) return;
            setState({
              user: profile,
              token,
              userId,
              isLoading: false,
              isAuthenticated: true,
            });
          } catch (error) {
            if (!isMounted) return;
            // Token might be expired, clear auth
            try {
              await clearAllAuth();
            } catch {
              // Ignore clearAllAuth errors
            }
            setState({
              user: null,
              token: null,
              userId: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          if (!isMounted) return;
          setState({
            user: null,
            token: null,
            userId: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (e) {
        console.warn('[Auth] Unexpected error during auth initialization:', e);
        if (!isMounted) return;
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

    return () => {
      isMounted = false;
    };
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
