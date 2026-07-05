import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  component?: React.ComponentType<any>;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, containerClassName = '', secureTextEntry, style, multiline, component: Component = TextInput, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { ref: _ref, ...restProps } = props as InputProps & { ref?: React.Ref<TextInput> };
    const inputProps = restProps as Omit<InputProps, 'ref' | 'label' | 'error' | 'leftIcon' | 'rightIcon' | 'containerClassName' | 'component'>;
    const RefComponent = Component as React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<TextInput>>;

    const isPassword = secureTextEntry !== undefined;
    const showPassword = isPassword && isPasswordVisible;
    const theme = useThemeColors();

    return (
      <View className={`${containerClassName}`}>
        {label && (
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</Text>
        )}
        <View
          className={`
            flex-row items-center bg-white dark:bg-slate-800 rounded-xl border px-3
            ${isFocused ? 'border-indigo-500' : error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}
          `}
          style={{ minHeight: 52 }}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <RefComponent
            ref={ref}
            className="flex-1"
            style={[
              {
                paddingTop: 14,
                paddingBottom: 16,
                fontSize: 16,
                color: theme.text,
              },
              Platform.OS === 'android' && {
                textAlignVertical: multiline ? 'top' : 'center',
                includeFontPadding: false,
              },
              style,
            ]}
            placeholderTextColor={theme.placeholder}
            secureTextEntry={isPassword && !showPassword}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline={multiline}
            {...inputProps}
          />
          {isPassword ? (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="ml-2 p-1"
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.iconMuted} />
              ) : (
                <Eye size={20} color={theme.iconMuted} />
              )}
            </TouchableOpacity>
          ) : rightIcon ? (
            <View className="ml-2">{rightIcon}</View>
          ) : null}
        </View>
        {error && (
          <Text className="text-sm text-rose-600 dark:text-rose-400 mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
