import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  Platform,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  primary: {
    bg: '#4f46e5',
    activeBg: '#4338ca',
    textColor: '#ffffff',
    fontWeight: '600' as const,
    borderColor: undefined,
  },
  secondary: {
    bg: '#ffffff',
    activeBg: '#f8fafc',
    textColor: '#334155',
    fontWeight: '500' as const,
    borderColor: '#e2e8f0',
  },
  outline: {
    bg: 'transparent',
    activeBg: '#f8fafc',
    textColor: '#334155',
    fontWeight: '500' as const,
    borderColor: '#cbd5e1',
  },
  destructive: {
    bg: '#e11d48',
    activeBg: '#be123c',
    textColor: '#ffffff',
    fontWeight: '600' as const,
    borderColor: undefined,
  },
  ghost: {
    bg: 'transparent',
    activeBg: '#f1f5f9',
    textColor: '#4f46e5',
    fontWeight: '500' as const,
    borderColor: undefined,
  },
};

const sizeConfig = {
  sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  onPress,
  ...props
}: ButtonProps) {
  const handlePress = (event: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const isDisabled = disabled || loading;
  const config = variantConfig[variant];
  const sizeConf = sizeConfig[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: config.bg,
          paddingVertical: sizeConf.paddingVertical,
          paddingHorizontal: sizeConf.paddingHorizontal,
          borderWidth: config.borderColor ? 1 : 0,
          borderColor: config.borderColor,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'outline' || variant === 'ghost' ? '#4f46e5' : '#ffffff'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: config.textColor,
                fontSize: sizeConf.fontSize,
                fontWeight: config.fontWeight,
              },
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
