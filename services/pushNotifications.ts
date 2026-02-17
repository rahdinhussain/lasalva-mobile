// Push notifications are DISABLED for this test build
// All functions return no-ops to prevent any native module access

import { Platform } from 'react-native';
import api from './api';

export async function registerForPushNotifications(): Promise<string | null> {
  console.info('[push] Push notifications disabled for testing');
  return null;
}

export async function savePushTokenToServer(pushToken: string): Promise<void> {
  // No-op
}

export async function removePushTokenFromServer(pushToken: string): Promise<void> {
  // No-op
}

interface Subscription {
  remove: () => void;
}

const noopSubscription: Subscription = { remove: () => {} };

export function addNotificationReceivedListener(callback: (notification: any) => void): Subscription {
  return noopSubscription;
}

export function addNotificationResponseListener(callback: (response: any) => void): Subscription {
  return noopSubscription;
}
