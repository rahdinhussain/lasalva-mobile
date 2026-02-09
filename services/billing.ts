import api from './api';
import { BillingSummary } from '@/types';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '@/constants';
import { getAuthToken } from '@/utils/storage';

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
  
  await WebBrowser.openBrowserAsync(url, {
    showTitle: true,
    enableBarCollapsing: true,
  });
}
