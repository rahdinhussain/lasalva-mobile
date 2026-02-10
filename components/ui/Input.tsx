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
import { colors } from '@/constants/colors';

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

    return (
      <View className={`${containerClassName}`}>
        {label && (
          <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
        )}
        <View
          className={`
            flex-row items-center bg-white rounded-xl border px-3
            ${isFocused ? 'border-indigo-500' : error ? 'border-rose-500' : 'border-slate-200'}
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
                color: '#0f172a',
              },
              Platform.OS === 'android' && {
                textAlignVertical: multiline ? 'top' : 'center',
                includeFontPadding: false,
              },
              style,
            ]}
            placeholderTextColor={colors.slate[500]}
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
                <EyeOff size={20} color={colors.slate[500]} />
              ) : (
                <Eye size={20} color={colors.slate[500]} />
              )}
            </TouchableOpacity>
          ) : rightIcon ? (
            <View className="ml-2">{rightIcon}</View>
          ) : null}
        </View>
        {error && (
          <Text className="text-sm text-rose-600 mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
