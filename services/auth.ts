import api from './api';
import { API_URL } from '@/constants';
import { AuthResponse } from '@/types';
import {
  getAuthToken,
  setAuthToken,
  setUserId,
  setAuthCookie,
  clearAllAuth,
  parseLasalvaAuthFromSetCookie,
} from '@/utils/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

/** Login using fetch so we can read Set-Cookie and store lasalva_auth for cookie-based API fallback. */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  } catch (networkError: any) {
    throw new Error(networkError?.message || 'Network error. Please check your connection.');
  }

  let data: AuthResponse & { error?: string; message?: string };
  try {
    data = (await res.json()) as AuthResponse & { error?: string; message?: string };
  } catch {
    throw new Error(
      res.ok ? 'Unexpected server response. Please try again.' : `Login failed (${res.status})`
    );
  }

  if (!res.ok) {
    throw new Error(data.error ?? data.message ?? 'Login failed');
  }
  const { token, userId, checkoutUrl } = data;
  if (!token || !userId) {
    throw new Error('Login succeeded but server returned incomplete data. Please try again.');
  }
  await setAuthToken(String(token));
  await setUserId(String(userId));
  const fromHeader = parseLasalvaAuthFromSetCookie(
    res.headers.get?.('set-cookie') ?? (res.headers as unknown as Record<string, string>)?.['set-cookie'] ?? null
  );
  const fromBody = (data as { lasalva_auth?: string; cookieToken?: string }).lasalva_auth
    ?? (data as { lasalva_auth?: string; cookieToken?: string }).cookieToken;
  const lasalvaAuth = fromHeader ?? fromBody ?? null;
  if (lasalvaAuth) {
    await setAuthCookie(lasalvaAuth);
  }
  return { token: String(token), userId: String(userId), checkoutUrl };
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with local logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    await clearAllAuth();
  }
}

/** Refresh the access token. Uses fetch to avoid axios 401 interceptor. Returns new token or null. */
export async function refreshAuthToken(): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) return null;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }

  let data: { token?: string; error?: string; lasalva_auth?: string };
  try {
    data = (await res.json()) as { token?: string; error?: string; lasalva_auth?: string };
  } catch {
    return null;
  }

  if (!res.ok || !data.token) return null;

  const newToken = String(data.token);
  await setAuthToken(newToken);
  const fromHeader = parseLasalvaAuthFromSetCookie(
    res.headers.get?.('set-cookie') ?? (res.headers as unknown as Record<string, string>)?.['set-cookie'] ?? null
  );
  const fromBody = data.lasalva_auth ?? null;
  const lasalvaAuth = fromHeader ?? fromBody ?? null;
  if (lasalvaAuth) await setAuthCookie(lasalvaAuth);
  return newToken;
}

export async function forgotPassword(data: ForgotPasswordData): Promise<void> {
  await api.post('/auth/forgot-password', data);
}

export async function resetPassword(data: ResetPasswordData): Promise<void> {
  await api.post('/auth/reset-password', data);
}

// --- Signup & OTP ---

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  ok: boolean;
  userId: string;
  requiresOtp: boolean;
}

export async function signup(data: SignupData): Promise<SignupResponse> {
  const response = await api.post<SignupResponse>('/auth/signup', data);
  return response.data;
}

export interface VerifyOtpData {
  userId: string;
  otp: string;
  businessName?: string;
  planName?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  userId: string;
  token: string;
  checkoutUrl?: string;
}

export async function verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse> {
  const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data);
  const { token, userId } = response.data;
  await setAuthToken(token);
  await setUserId(userId);
  return response.data;
}
