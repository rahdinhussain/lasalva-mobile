import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ViewProps, Animated } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  pressable?: boolean;
  style?: ViewProps['style'];
}

export function Card({ children, className = '', onPress, pressable = false, style }: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (pressable || onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 200,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 200,
      bounciness: 4,
    }).start();
  };

  if (onPress || pressable) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View
      style={style}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </View>
  );
}

Card.Header = function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={`p-4 ${className}`}>{children}</View>;
};

Card.Title = function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </Text>
  );
};

Card.Description = function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-sm text-slate-500 mt-1 ${className}`}>
      {children}
    </Text>
  );
};

Card.Content = function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={`px-4 pb-4 ${className}`}>{children}</View>;
};

Card.Footer = function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`px-4 py-3 border-t border-slate-100 ${className}`}>
      {children}
    </View>
  );
};
