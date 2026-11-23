import api from './api';
import { BillingSummary } from '@/types';
import { Linking } from 'react-native';

// Lazy load expo-web-browser to prevent native crashes
let WebBrowser: typeof import('expo-web-browser') | null = null;
try {
  WebBrowser = require('expo-web-browser');
} catch (e) {
  console.warn('[billing] expo-web-browser not available');
}

interface BillingSummaryResponse {
  success?: boolean;
  billing?: BillingSummary;
  summary?: BillingSummary;
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const response = await api.get<BillingSummaryResponse>('/billing/summary');
  // Handle both wrapped and unwrapped response formats
  if (response.data.summary) return response.data.summary;
  if (response.data.billing) {
    return response.data.billing;
  }
  return response.data as unknown as BillingSummary;
}

export async function openBillingPortal(): Promise<void> {
  const { data } = await api.post<{url: string}>('/billing/portal');
  const url = data.url;
  if (!url || new URL(url).protocol !== 'https:') throw new Error('Could not open billing.');

  // Use expo-web-browser if available, otherwise fall back to Linking
  if (WebBrowser) {
    await WebBrowser.openBrowserAsync(url, {
      showTitle: true,
      enableBarCollapsing: true,
    });
  } else {
    await Linking.openURL(url);
  }
}
