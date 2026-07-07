import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ViewProps, Animated, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  pressable?: boolean;
  style?: ViewProps['style'];
}

// Soft, diffuse elevation shared by all cards. On pressable cards it sits on the
// (non-clipping) outer wrapper so it renders fully on iOS; elevation covers Android.
const cardShadow = StyleSheet.create({
  shadow: {
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
});

const baseCardClass =
  'bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden';

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
      <Animated.View
        style={[{ transform: [{ scale: scaleAnim }] }, cardShadow.shadow, style]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          className={`${baseCardClass} ${className}`}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={[cardShadow.shadow, style]} className={`${baseCardClass} ${className}`}>
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
    <Text className={`text-lg font-semibold text-slate-900 dark:text-slate-50 ${className}`}>
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
    <Text className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`}>
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
    <View className={`px-4 py-3 border-t border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </View>
  );
};
