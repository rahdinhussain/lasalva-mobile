import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants';

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

export async function getAuthToken(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function setAuthToken(token: string): Promise<void> {
  return setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export async function clearAuthToken(): Promise<void> {
  return deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function getUserId(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.USER_ID);
}

export async function setUserId(id: string): Promise<void> {
  return setSecureItem(STORAGE_KEYS.USER_ID, id);
}

export async function clearUserId(): Promise<void> {
  return deleteSecureItem(STORAGE_KEYS.USER_ID);
}

export async function getAuthCookie(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.AUTH_COOKIE);
}

export async function setAuthCookie(value: string): Promise<void> {
  return setSecureItem(STORAGE_KEYS.AUTH_COOKIE, value);
}

export async function clearAuthCookie(): Promise<void> {
  return deleteSecureItem(STORAGE_KEYS.AUTH_COOKIE);
}

export function parseLasalvaAuthFromSetCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader || typeof setCookieHeader !== 'string') return null;
  const prefix = 'lasalva_auth=';
  const idx = setCookieHeader.indexOf(prefix);
  if (idx === -1) return null;
  const start = idx + prefix.length;
  const end = setCookieHeader.indexOf(';', start);
  const value = end === -1 ? setCookieHeader.slice(start) : setCookieHeader.slice(start, end);
  return value.trim() || null;
}

export async function clearAllAuth(): Promise<void> {
  await Promise.all([clearAuthToken(), clearUserId(), clearAuthCookie()]);
}
