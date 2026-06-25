import '../global.css';
import React, { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Tell React Query whether the app is in the foreground. On native there is no
// window-focus event, so without this the 30s appointment polling (and any
// refetchOnWindowFocus) keeps firing while the app is backgrounded, wasting
// battery and data. Pausing while backgrounded also refreshes data the moment
// the user returns to the app.
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export default function RootLayout() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <BusinessProvider>
          <ErrorBoundary>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ErrorBoundary>
        </BusinessProvider>
      </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
