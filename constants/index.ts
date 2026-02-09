export * from './colors';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/** Base URL for public booking pages (e.g. https://lasalva.com). Link is BOOKING_BASE_URL/slug. */
export const BOOKING_BASE_URL =
  process.env.EXPO_PUBLIC_BOOKING_BASE_URL || API_URL;

/** Web signup page URL. Users sign up and verify on the web; open this from the app login screen. */
export const WEB_SIGNUP_URL =
  process.env.EXPO_PUBLIC_WEB_SIGNUP_URL || `${BOOKING_BASE_URL.replace(/\/$/, '')}/signup`;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  AUTH_COOKIE: 'auth_cookie', // lasalva_auth for cookie-based API (fallback when backend expects cookie)
} as const;

export const QUERY_KEYS = {
  PROFILE: ['profile'],
  BUSINESS: ['business'],
  BUSINESS_HOURS: ['business', 'hours'],
  APPOINTMENTS: ['appointments'],
  AVAILABILITY: ['availability'],
  STAFF: ['staff'],
  SERVICES: ['services'],
  BILLING: ['billing'],
} as const;

export const STALE_TIME = {
  SHORT: 1000 * 60, // 1 minute
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 15, // 15 minutes
} as const;

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const TIME_SLOTS = {
  START_HOUR: 6, // 6 AM
  END_HOUR: 22, // 10 PM
  INTERVAL_MINUTES: 15,
} as const;
