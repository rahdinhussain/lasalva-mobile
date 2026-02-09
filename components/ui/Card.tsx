import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  pressable?: boolean;
  style?: ViewProps['style'];
}

export function Card({ children, className = '', onPress, pressable = false, style }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable || onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  if (onPress || pressable) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
      >
        {children}
      </AnimatedTouchable>
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

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

Card.Header = function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <View className={`p-4 ${className}`}>{children}</View>;
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

Card.Title = function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <Text className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </Text>
  );
};

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

Card.Description = function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <Text className={`text-sm text-slate-500 mt-1 ${className}`}>
      {children}
    </Text>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

Card.Content = function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={`px-4 pb-4 ${className}`}>{children}</View>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

Card.Footer = function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <View className={`px-4 py-3 border-t border-slate-100 ${className}`}>
      {children}
    </View>
  );
};
