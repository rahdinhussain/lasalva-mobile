import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Platform, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  value,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: ToggleProps) {
  const { scheme } = useThemeColors();
  const trackOff = scheme === 'dark' ? '#475569' : '#e2e8f0'; // slate-600 / slate-200
  const thumbPos = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(thumbPos, {
      toValue: value ? 20 : 0,
      useNativeDriver: true,
      speed: 100,
      bounciness: 6,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center justify-between py-2 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {(label || description) && (
        <View className="flex-1 mr-3">
          {label && (
            <Text className="text-base font-medium text-slate-900 dark:text-slate-50">{label}</Text>
          )}
          {description && (
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</Text>
          )}
        </View>
      )}
      <View
        className="w-12 h-7 rounded-full p-1 justify-center"
        style={{ backgroundColor: value ? '#4f46e5' : trackOff }}
      >
        <Animated.View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
            transform: [{ translateX: thumbPos }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>
    </Pressable>
  );
}
