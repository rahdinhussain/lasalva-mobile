import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  registerForPushNotifications,
  savePushTokenToServer,
  removePushTokenFromServer,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/services/pushNotifications';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook that manages push notification registration and response handling.
 * - Registers for push notifications when the user is authenticated.
 * - Saves the push token to the backend.
 * - Handles notification taps to navigate to relevant screens.
 */
export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const tokenSentRef = useRef(false);

  // Register for push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      tokenSentRef.current = false;
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const token = await registerForPushNotifications();
        if (cancelled || !token) return;

        setPushToken(token);

        if (!tokenSentRef.current) {
          await savePushTokenToServer(token);
          tokenSentRef.current = true;
        }
      } catch (e) {
        console.warn('[push] Failed to register for push notifications:', e);
      }
    }

    register();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Listen for notification taps and navigate
  useEffect(() => {
    const responseSubscription = addNotificationResponseListener((response) => {
      try {
        const data = response?.notification?.request?.content?.data;
        if (data?.type === 'appointment' && data?.appointmentId) {
          router.push('/(tabs)/calendar');
        }
      } catch (e) {
        console.warn('[push] Error handling notification response:', e);
      }
    });

    const receivedSubscription = addNotificationReceivedListener((notification) => {
      console.info('[push] Notification received:', notification?.request?.content?.title);
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [router]);

  return {
    pushToken,
    removePushToken: async () => {
      if (pushToken) {
        await removePushTokenFromServer(pushToken);
        setPushToken(null);
        tokenSentRef.current = false;
      }
    },
  };
}
