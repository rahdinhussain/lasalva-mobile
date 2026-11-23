import { Stack, Redirect, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isHydrated } = useAuth();
  const segments = useSegments();
  const isRecoveryLink = segments[segments.length - 1] === 'reset-password';

  // Wait for auth hydration only. Do NOT gate on isLoading: during an in-progress
  // login the auth screen must stay mounted so the login form (and any error) is
  // visible with its own button spinner, instead of a full-screen spinner takeover.
  if (!isHydrated && !isRecoveryLink) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Redirect to calendar if already authenticated
  if (isAuthenticated && !isRecoveryLink) {
    return <Redirect href="/(tabs)/calendar" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
