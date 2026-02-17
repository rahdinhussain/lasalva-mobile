// Safe haptics wrapper - falls back to no-op if native module unavailable
import { Platform } from 'react-native';

type ImpactFeedbackStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
type NotificationFeedbackType = 'success' | 'warning' | 'error';

let Haptics: typeof import('expo-haptics') | null = null;

// Only try to load on iOS (Android doesn't always support haptics)
if (Platform.OS === 'ios') {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    // Native module not available
  }
}

export async function impactAsync(style: ImpactFeedbackStyle = 'medium'): Promise<void> {
  if (Haptics) {
    try {
      await Haptics.impactAsync(
        style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
        style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
        style === 'soft' ? Haptics.ImpactFeedbackStyle.Soft :
        Haptics.ImpactFeedbackStyle.Rigid
      );
    } catch {
      // Ignore haptics errors
    }
  }
}

export async function notificationAsync(type: NotificationFeedbackType = 'success'): Promise<void> {
  if (Haptics) {
    try {
      await Haptics.notificationAsync(
        type === 'success' ? Haptics.NotificationFeedbackType.Success :
        type === 'warning' ? Haptics.NotificationFeedbackType.Warning :
        Haptics.NotificationFeedbackType.Error
      );
    } catch {
      // Ignore haptics errors
    }
  }
}

export async function selectionAsync(): Promise<void> {
  if (Haptics) {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore haptics errors
    }
  }
}
