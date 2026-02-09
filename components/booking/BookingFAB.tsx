import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface BookingFABProps {
  onPress: () => void;
}

export function BookingFAB({ onPress }: BookingFABProps) {
  const insets = useSafeAreaInsets();
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

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[
        animatedStyle,
        {
          position: 'absolute',
          right: 20,
          bottom: insets.bottom + 16,
          shadowColor: '#4f46e5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      className="w-14 h-14 rounded-full bg-indigo-600 items-center justify-center"
      accessibilityRole="button"
      accessibilityLabel="Book new appointment"
    >
      <Plus size={24} color="#ffffff" strokeWidth={2.5} />
    </AnimatedTouchable>
  );
}
