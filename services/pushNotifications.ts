import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

/**
 * Configure notification behavior when app is in foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and return the Expo push token.
 * Returns null if notifications are not available (e.g. simulator, permissions denied).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.info('[push] Push notifications are not available on simulators/emulators.');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.info('[push] Push notification permission not granted.');
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4f46e5',
    });
  }

  try {
    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as { manifest?: { extra?: { eas?: { projectId?: string } } } })
        .manifest?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn(
        '[push] Missing EAS projectId. Set expo.extra.eas.projectId in app.json or provide it at build time.'
      );
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (err) {
    console.error('[push] Failed to get push token:', err);
    return null;
  }
}

/**
 * Send the push token to the backend for storage.
 * Called after login or when the token changes.
 */
export async function savePushTokenToServer(pushToken: string): Promise<void> {
  try {
    await api.post('/push-tokens', {
      token: pushToken,
      platform: Platform.OS,
    });
    console.info('[push] Push token saved to server.');
  } catch (err) {
    console.error('[push] Failed to save push token to server:', err);
  }
}

/**
 * Remove the push token from the backend.
 * Called on logout.
 */
export async function removePushTokenFromServer(pushToken: string): Promise<void> {
  try {
    await api.delete('/push-tokens', { data: { token: pushToken } });
    console.info('[push] Push token removed from server.');
  } catch (err) {
    console.error('[push] Failed to remove push token from server:', err);
  }
}

/**
 * Add a listener for when a notification is received while the app is foregrounded.
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for when the user taps a notification.
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
