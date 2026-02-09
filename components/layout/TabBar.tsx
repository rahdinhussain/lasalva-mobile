import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Calendar, Users, Briefcase, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const icons: Record<string, typeof Calendar> = {
  calendar: Calendar,
  staff: Users,
  services: Briefcase,
  settings: Settings,
};

const labels: Record<string, string> = {
  calendar: 'Calendar',
  staff: 'Staff',
  services: 'Services',
  settings: 'Settings',
};

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ routeName, isFocused, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const Icon = icons[routeName] || Calendar;

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <AnimatedTouchable
      style={animatedStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="flex-1 items-center justify-center py-2"
    >
      <View
        className={`items-center justify-center rounded-xl px-4 py-1.5 ${
          isFocused ? 'bg-indigo-50' : ''
        }`}
      >
        <Icon
          size={22}
          color={isFocused ? colors.indigo[600] : colors.slate[500]}
          strokeWidth={isFocused ? 2.5 : 2}
        />
        <Text
          className={`text-xs mt-1 ${
            isFocused ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          {labels[routeName] || routeName}
        </Text>
      </View>
    </AnimatedTouchable>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-t border-slate-100 flex-row"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Skip _sitemap and +not-found routes
        if (route.name.startsWith('_') || route.name.startsWith('+')) {
          return null;
        }

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}
