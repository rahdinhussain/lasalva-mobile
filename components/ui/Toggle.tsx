import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

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
  const toggleValue = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    toggleValue.value = withSpring(value ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      toggleValue.value,
      [0, 1],
      [colors.slate[200], colors.indigo[600]]
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: toggleValue.value * 20 }],
  }));

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
            <Text className="text-base font-medium text-slate-900">{label}</Text>
          )}
          {description && (
            <Text className="text-sm text-slate-500 mt-0.5">{description}</Text>
          )}
        </View>
      )}
      <Animated.View
        style={trackStyle}
        className="w-12 h-7 rounded-full p-1"
      >
        <Animated.View
          style={thumbStyle}
          className="w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </Animated.View>
    </Pressable>
  );
}
