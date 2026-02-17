import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Link } from 'expo-router';
import { WEB_SIGNUP_URL } from '@/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, Logo } from '@/components/ui';
import { colors } from '@/constants/colors';
import { ApiError } from '@/types';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation is handled by the auth guard
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo/Header */}
          <View className="items-center mb-8">
            <Logo size="lg" className="mb-4" />
            <Text className="text-2xl font-bold text-slate-900">Welcome back</Text>
            <Text className="text-slate-500 mt-1">Sign in to your account</Text>
          </View>

          {/* Login Card */}
          <Card className="p-6">
            {error && (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
                <Text className="text-rose-700 text-sm text-center">{error}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Mail size={20} color={colors.slate[500]} />}
              containerClassName="mb-4"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
              leftIcon={<Lock size={20} color={colors.slate[500]} />}
              containerClassName="mb-2"
            />

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity className="self-end mb-6">
                <Text className="text-indigo-600 text-sm font-medium">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>

            <Button
              variant="primary"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
            >
              Log in
            </Button>

            <TouchableOpacity
              onPress={() => Linking.openURL(WEB_SIGNUP_URL)}
              className="mt-12 items-center"
            >
              <Text className="text-indigo-600 text-sm font-medium">
                Sign up (web)
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
