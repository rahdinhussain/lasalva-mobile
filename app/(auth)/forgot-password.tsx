import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { forgotPassword } from '@/services/auth';
import { Button, Input, Card, IconButton, Logo } from '@/components/ui';
import { colors } from '@/constants/colors';
import { ApiError } from '@/types';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email address');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setIsSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to send reset email. Please try again.');
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
              Check your email
            </Text>
            <Text className="text-slate-500 text-center mt-2">
              We've sent a password reset link to{'\n'}
              <Text className="font-medium text-slate-700">{email}</Text>
            </Text>
            <Text className="text-slate-500 text-center mt-3 text-sm">
              Can't find it? Check your spam or junk folder.
            </Text>
            {error && (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mt-4 w-full">
                <Text className="text-rose-700 text-sm text-center">{error}</Text>
              </View>
            )}
            <Button
              variant="primary"
              fullWidth
              onPress={() => router.back()}
              className="mt-6"
            >
              Back to login
            </Button>
            <Button
              variant="outline"
              fullWidth
              loading={isLoading}
              onPress={handleResend}
              className="mt-3"
            >
              Resend reset link
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
            <Text className="text-2xl font-bold text-slate-900">Reset password</Text>
            <Text className="text-slate-500 mt-1 text-center">
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>

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
                setEmailError(undefined);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Mail size={20} color={colors.slate[500]} />}
              containerClassName="mb-6"
            />

            <Button
              variant="primary"
              fullWidth
              loading={isLoading}
              onPress={handleSubmit}
            >
              Send reset link
            </Button>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
