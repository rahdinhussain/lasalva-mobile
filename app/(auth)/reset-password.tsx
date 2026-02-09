import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { resetPassword } from '@/services/auth';
import { Button, Input, Card, IconButton, Logo } from '@/components/ui';
import { colors } from '@/constants/colors';
import { ApiError } from '@/types';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({ token, newPassword: password });
      setIsSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 justify-center px-6">
          <Card className="p-6 items-center">
            <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
              <CheckCircle size={32} color={colors.emerald[500]} />
            </View>
            <Text className="text-xl font-semibold text-slate-900 text-center">
              Password reset
            </Text>
            <Text className="text-slate-500 text-center mt-2">
              Your password has been successfully reset. You can now log in with your new password.
            </Text>
            <Button
              variant="primary"
              fullWidth
              onPress={() => router.replace('/(auth)/login')}
              className="mt-6"
            >
              Go to login
            </Button>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-4 py-2">
        <IconButton
          icon={<ArrowLeft size={24} color={colors.slate[700]} />}
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-8">
            <Logo size="md" className="mb-4" />
            <Text className="text-2xl font-bold text-slate-900">New password</Text>
            <Text className="text-slate-500 mt-1 text-center">
              Enter your new password below
            </Text>
          </View>

          <Card className="p-6">
            {error && (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
                <Text className="text-rose-700 text-sm text-center">{error}</Text>
              </View>
            )}

            <Input
              label="New password"
              placeholder="Enter new password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.slate[500]} />}
              containerClassName="mb-4"
            />

            <Input
              label="Confirm password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.slate[500]} />}
              containerClassName="mb-6"
            />

            <Button
              variant="primary"
              fullWidth
              loading={isLoading}
              onPress={handleSubmit}
            >
              Reset password
            </Button>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
