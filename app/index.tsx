import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isHydrated } = useAuth();

  // Wait for auth state to be fully hydrated before routing.
  // Gate ONLY on hydration -- not on isLoading -- so an in-progress login/logout
  // (isLoading=true while already hydrated) does not replace the screen with a
  // full-screen spinner. The login button shows its own loading state.
  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/calendar" />;
  }

  return <Redirect href="/(auth)/login" />;
}
