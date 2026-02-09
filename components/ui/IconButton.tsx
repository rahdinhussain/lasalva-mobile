import React from 'react';
import { TouchableOpacity, Platform, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type IconButtonVariant = 'default' | 'primary' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: 'bg-slate-100 active:bg-slate-200',
  primary: 'bg-indigo-600 active:bg-indigo-700',
  ghost: 'bg-transparent active:bg-slate-100',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  onPress,
  ...props
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = (event: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  return (
    <AnimatedTouchable
      style={animatedStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      className={`
        items-center justify-center rounded-xl
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      {...props}
    >
      {icon}
    </AnimatedTouchable>
  );
}
