import api from './api';
import { BillingSummary } from '@/types';
import { Linking } from 'react-native';
import { API_URL } from '@/constants';
import { getAuthToken } from '@/utils/storage';

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
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const response = await api.get<BillingSummaryResponse>('/billing/summary');
  // Handle both wrapped and unwrapped response formats
  if (response.data.billing) {
    return response.data.billing;
  }
  return response.data as unknown as BillingSummary;
}

export async function openBillingPortal(returnPath: string = '/settings/billing'): Promise<void> {
  const token = await getAuthToken();
  const url = `${API_URL}/api/billing/portal?return=${encodeURIComponent(returnPath)}`;
  
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
