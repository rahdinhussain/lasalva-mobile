import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { GradientHeader } from './GradientHeader';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  transparent?: boolean;
  className?: string;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftContent,
  rightContent,
  transparent = false,
  className = '',
}: HeaderProps) {
  const router = useRouter();
  const theme = useThemeColors();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Solid screen headers render as the gradient hero for a consistent modern
  // look. `transparent` headers keep the flat, chromeless style (e.g. overlays).
  if (!transparent) {
    return (
      <GradientHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onBack={onBack}
        leftContent={leftContent}
        rightContent={rightContent}
        className={className}
      />
    );
  }

  return (
    <View
      className={`
        flex-row items-center justify-between px-4 py-3
        ${className}
      `}
    >
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="mr-2 -ml-2 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={theme.icon} />
          </TouchableOpacity>
        )}
        {leftContent}
        {title && !leftContent && (
          <View className="flex-1">
            <Text className="text-xl font-semibold text-slate-900 dark:text-slate-50" numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text className="text-sm text-slate-500 dark:text-slate-400" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>
      {rightContent && <View className="flex-row items-center">{rightContent}</View>}
    </View>
  );
}
