import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Logo size="xl" className="mb-6" />
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/calendar" />;
  }

  return <Redirect href="/(auth)/login" />;
}
