import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Calendar, Users, Briefcase, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';

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
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 200,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 200,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const Icon = icons[routeName] || Calendar;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
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
      </TouchableOpacity>
    </Animated.View>
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
