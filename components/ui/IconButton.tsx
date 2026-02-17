import React from 'react';
import { TouchableOpacity, Platform, TouchableOpacityProps, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

type IconButtonVariant = 'default' | 'primary' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
}

const variantConfig = {
  default: { bg: '#f1f5f9' },
  primary: { bg: '#4f46e5' },
  ghost: { bg: 'transparent' },
};

const sizeConfig = {
  sm: 32,
  md: 40,
  lg: 48,
};

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  onPress,
  ...props
}: IconButtonProps) {
  const handlePress = (event: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const dimension = sizeConfig[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: variantConfig[variant].bg,
          width: dimension,
          height: dimension,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      {...props}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
