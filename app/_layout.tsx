import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const queryClient = new QueryClient();

export default function RootLayout() {
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
