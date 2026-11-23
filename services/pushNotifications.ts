import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import api from './api';

const deviceTokenKey = 'lasalva_registered_push_token';
function supported() {
  return Platform.OS !== 'web' && Device.isDevice && Constants.appOwnership !== 'expo';
}
export async function registerForPushNotifications(): Promise<string | null> {
  if (!supported()) return null;
  const notifications = await import('expo-notifications');
  if (Platform.OS === 'android') await notifications.setNotificationChannelAsync('default', {
    name: 'Appointments', importance: notifications.AndroidImportance.DEFAULT,
  });
  const permission = await notifications.getPermissionsAsync();
  if (!permission.granted && !(await notifications.requestPermissionsAsync()).granted) return null;
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  return (await notifications.getExpoPushTokenAsync({ projectId })).data;
}
export async function savePushTokenToServer(token: string) {
  await api.post('/push-tokens', { token, platform: Platform.OS });
  await SecureStore.setItemAsync(deviceTokenKey, token);
}
export async function removePushTokenFromServer(token?: string) {
  if (!supported()) return;
  const registered = token ?? await SecureStore.getItemAsync(deviceTokenKey);
  if (registered) {
    await api.delete('/push-tokens', { data: { token: registered } });
    await SecureStore.deleteItemAsync(deviceTokenKey);
  }
}
export function addNotificationResponseListener(callback: (response: any) => void) {
  if (!supported()) return { remove() {} };
  return (require('expo-notifications') as typeof import('expo-notifications')).addNotificationResponseReceivedListener(callback);
}
export function addNotificationReceivedListener(callback: (notification: any) => void) {
  if (!supported()) return { remove() {} };
  return (require('expo-notifications') as typeof import('expo-notifications')).addNotificationReceivedListener(callback);
}
