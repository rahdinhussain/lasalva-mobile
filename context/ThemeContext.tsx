import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import { colorScheme as nwColorScheme, useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants';
import {
  getThemeColors,
  type ColorScheme,
  type ThemeColors,
} from '@/constants/colors';

/** User-selectable appearance preference. `system` follows the OS setting. */
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The user's stored preference. */
  preference: ThemePreference;
  /** The concrete scheme currently in effect ('light' | 'dark'). */
  scheme: ColorScheme;
  /** Resolved color tokens for the active scheme (for inline/imperative props). */
  colors: ThemeColors;
  /** Persist and apply a new preference. */
  setPreference: (preference: ThemePreference) => void;
  /** True once the stored preference has been loaded. */
  isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

async function readStoredPreference(): Promise<ThemePreference> {
  try {
    const value =
      Platform.OS === 'web'
        ? localStorage.getItem(STORAGE_KEYS.THEME)
        : await SecureStore.getItemAsync(STORAGE_KEYS.THEME);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    // ignore — fall back to system default
  }
  return 'system';
}

async function writeStoredPreference(preference: ThemePreference): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.THEME, preference);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.THEME, preference);
    }
  } catch {
    // ignore — preference simply won't persist
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = useState(false);

  // NativeWind's reactive hook. Returns the concrete active scheme, updating
  // when the preference changes or (when following the OS) the system flips.
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';

  // Load the persisted preference once and apply it to NativeWind.
  useEffect(() => {
    let mounted = true;
    readStoredPreference().then((stored) => {
      if (!mounted) return;
      setPreferenceState(stored);
      nwColorScheme.set(stored);
      setIsHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    nwColorScheme.set(next);
    void writeStoredPreference(next);
  }, []);

  const value: ThemeContextValue = {
    preference,
    scheme,
    colors: getThemeColors(scheme),
    setPreference,
    isHydrated,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
