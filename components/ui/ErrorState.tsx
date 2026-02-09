import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`}>
      <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
        <AlertCircle size={32} color={colors.rose[500]} />
      </View>
      <Text className="text-lg font-semibold text-slate-900 text-center">
        {title}
      </Text>
      <Text className="text-sm text-slate-500 text-center mt-2 max-w-xs">
        {message}
      </Text>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry} className="mt-6">
          Try Again
        </Button>
      )}
    </View>
  );
}
