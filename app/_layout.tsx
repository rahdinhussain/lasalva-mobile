import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { ErrorBoundary } from '@/components/ui';
import * as Linking from 'expo-linking';

// Create a client outside of the component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Providers wrapper component
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BusinessProvider>
          <BottomSheetModalProvider>
            {children}
          </BottomSheetModalProvider>
        </BusinessProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/**
 * Handle deep links from email notifications.
 * Supports:
 *   - lasalva://reset-password?token=...
 *   - https://lasalva.com/reset-password?token=...
 */
function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const { url } = event;
      if (!url) return;

      try {
        const parsed = Linking.parse(url);
        const path = parsed.path ?? '';
        const token = parsed.queryParams?.token as string | undefined;

        if (path === 'reset-password' && token) {
          router.replace({ pathname: '/(auth)/reset-password', params: { token } });
        }
      } catch {
        // Invalid or unsupported deep link; ignore to avoid logging sensitive URL
      }
    }

    // Handle the URL that opened the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle URLs when the app is already open (warm start)
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  return null;
}

/** Register push notifications and handle notification taps. */
function PushNotificationHandler() {
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Providers>
            <DeepLinkHandler />
            <PushNotificationHandler />
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </Providers>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
