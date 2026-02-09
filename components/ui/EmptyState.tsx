import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`}>
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-lg font-semibold text-slate-900 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-slate-500 text-center mt-2 max-w-xs">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
