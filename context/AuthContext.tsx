import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getAuthToken, getUserId, clearAllAuth, setAuthToken, setUserId } from '@/utils/storage';
import { login as loginApi, logout as logoutApi, LoginCredentials } from '@/services/auth';
import { getProfile } from '@/services/profile';
import { setAuthInvalidatedCallback, setAuthReady, setAuthGracePeriod, isInGracePeriod } from '@/services/api';
import { Profile, AuthResponse, ApiError } from '@/types';

interface AuthState {
  user: Profile | null;
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forceLogout: () => Promise<void>;
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
    isHydrated: false,
  });
  
  const isMountedRef = useRef(true);

  // Initialize auth state from secure storage
  useEffect(() => {
    isMountedRef.current = true;
    
    // Mark auth as NOT ready during hydration - prevents 401 interceptor from auto-logout
    setAuthReady(false);

    async function loadStoredAuth() {
      try {
        let token: string | null = null;
        let userId: string | null = null;
        
        try {
          [token, userId] = await Promise.all([getAuthToken(), getUserId()]);
        } catch (storageError) {
          console.warn('[Auth] Failed to read from secure storage:', storageError);
        }

        if (!isMountedRef.current) return;

        // If we have a stored token and userId, trust them and set authenticated
        // This prevents logout on network errors during app startup
        if (token && userId) {
          setState({
            user: null,
            token,
            userId,
            isLoading: false,
            isAuthenticated: true,
            isHydrated: true,
          });
          
          // Mark auth as ready AFTER setting authenticated state
          // This enables 401 handling in the API interceptor
          setAuthReady(true);
          
          // Fetch profile in background - don't logout on failure during hydration
          // Network errors should NOT cause logout
          try {
            const profile = await getProfile();
            if (!isMountedRef.current) return;
            setState((prev) => ({
              ...prev,
              user: profile,
            }));
          } catch (error) {
            // During hydration, we don't auto-logout on errors
            // The user has a valid stored token, so keep them logged in
            // Only explicit manual logout or post-hydration 401s should logout
            const apiError = error as ApiError;
            if (apiError?.status === 401 || apiError?.code === 'UNAUTHORIZED') {
              // 401 during profile fetch - check if storage was cleared
              // (It won't be, because isAuthReady was just set to true after state update)
              // We intentionally keep the user logged in and let them retry
              console.warn('[Auth] Profile fetch returned 401 during hydration, keeping session');
            } else {
              // Network error or other non-auth error - definitely keep user logged in
              console.warn('[Auth] Profile fetch failed (non-auth error), keeping session:', error);
            }
          }
        } else {
          // No stored credentials
          if (!isMountedRef.current) return;
          setState({
            user: null,
            token: null,
            userId: null,
            isLoading: false,
            isAuthenticated: false,
            isHydrated: true,
          });
          // Auth is ready but user is not authenticated
          setAuthReady(true);
        }
      } catch (e) {
        console.warn('[Auth] Unexpected error during auth initialization:', e);
        if (!isMountedRef.current) return;
        // On unexpected errors, check if we have stored credentials
        // Don't logout blindly - preserve session if possible
        try {
          const [token, userId] = await Promise.all([getAuthToken(), getUserId()]);
          if (token && userId) {
            setState({
              user: null,
              token,
              userId,
              isLoading: false,
              isAuthenticated: true,
              isHydrated: true,
            });
            setAuthReady(true);
            return;
          }
        } catch {
          // Storage also failed
        }
        setState({
          user: null,
          token: null,
          userId: null,
          isLoading: false,
          isAuthenticated: false,
          isHydrated: true,
        });
        setAuthReady(true);
      }
    }

    loadStoredAuth();

    return () => {
      isMountedRef.current = false;
      // Reset auth ready state on unmount
      setAuthReady(false);
    };
  }, []);

  // Register callback for API 401 handling - only after hydration
  useEffect(() => {
    // Only register callback when hydrated to prevent race conditions
    if (!state.isHydrated) return;
    
    const handleAuthInvalidated = async () => {
      // Defense-in-depth: if we're in the post-login grace period, never logout
      if (isInGracePeriod()) {
        console.warn('[Auth] Auth invalidated callback skipped - in grace period');
        return;
      }

      // Verify auth is actually cleared before updating state.
      // This prevents race conditions where a stale 401 fires after a fresh login.
      try {
        const currentToken = await getAuthToken();
        if (currentToken) {
          console.warn('[Auth] Auth invalidated callback skipped - new token exists');
          return;
        }
      } catch {
        // Storage error - proceed with logout
      }
      
      if (isMountedRef.current) {
        setState({
          user: null,
          token: null,
          userId: null,
          isLoading: false,
          isAuthenticated: false,
          isHydrated: true,
        });
      }
    };

    setAuthInvalidatedCallback(handleAuthInvalidated);

    return () => {
      setAuthInvalidatedCallback(null);
    };
  }, [state.isHydrated]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (!isMountedRef.current) throw new Error('Component unmounted');
    setState((prev) => ({ ...prev, isLoading: true }));
    
    // Disable 401 auto-logout during login to prevent race conditions
    // (e.g., getProfile() failing before new token is fully recognized)
    setAuthReady(false);
    
    try {
      const response = await loginApi(credentials);

      // Token is now stored in SecureStore by loginApi().
      // Start the grace period NOW so that any queries triggered by
      // isAuthenticated becoming true won't cause a 401-driven logout.
      setAuthGracePeriod(15000);

      // Fetch user profile after login
      let profile: Profile | null = null;
      try {
        profile = await getProfile();
      } catch {
        // getProfile failed - likely 401 or network error
        // Since we disabled 401 handling, tokens are still stored
        // Just continue without profile - auto-retry will fetch it later
        console.warn('[Auth] Profile fetch after login failed, continuing without profile');
      }

      if (!isMountedRef.current) throw new Error('Component unmounted');
      
      setState({
        user: profile,
        token: response.token,
        userId: response.userId,
        isLoading: false,
        isAuthenticated: true,
        isHydrated: true,
      });
      
      // Re-enable 401 handling now that login is complete.
      // Grace period is active, so any 401s from post-login queries are safely ignored.
      setAuthReady(true);

      return response;
    } catch (error) {
      // Re-enable 401 handling even on login failure
      setAuthReady(true);
      setAuthGracePeriod(0);
      
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isMountedRef.current) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await logoutApi();
    } finally {
      if (isMountedRef.current) {
        setState({
          user: null,
          token: null,
          userId: null,
          isLoading: false,
          isAuthenticated: false,
          isHydrated: true,
        });
      }
    }
  }, []);

  // Force logout - called when API returns 401 and refresh fails
  const forceLogout = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      await clearAllAuth();
    } catch {
      // Ignore storage errors during force logout
    }
    if (isMountedRef.current) {
      setState({
        user: null,
        token: null,
        userId: null,
        isLoading: false,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.token || !isMountedRef.current) return;

    try {
      const profile = await getProfile();
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, user: profile }));
      }
    } catch (error) {
      // Don't logout on profile refresh errors
      // The API interceptor handles 401s centrally when isAuthReady is true
      // If it cleared auth, the callback will update state
      // For non-auth errors (network, etc.), keep existing state
      console.warn('[Auth] Profile refresh failed, keeping session:', error);
    }
  }, [state.token]);

  // Auto-retry profile fetch when authenticated but profile is missing
  useEffect(() => {
    if (state.isAuthenticated && !state.user && state.token && !state.isLoading && state.isHydrated) {
      const timer = setTimeout(() => {
        refreshUser();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.isAuthenticated, state.user, state.token, state.isLoading, state.isHydrated, refreshUser]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    forceLogout,
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
