import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Grid3X3, CalendarDays, Clock, List } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export type ViewMode = 'month' | 'week' | 'day' | 'list';

interface ViewModeToggleProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes: { key: ViewMode; label: string; Icon: typeof Grid3X3 }[] = [
  { key: 'month', label: 'Month', Icon: Grid3X3 },
  { key: 'week', label: 'Week', Icon: CalendarDays },
  { key: 'day', label: 'Day', Icon: Clock },
  { key: 'list', label: 'List', Icon: List },
];

export function ViewModeToggle({ activeMode, onModeChange }: ViewModeToggleProps) {
  return (
    <View className="flex-row bg-slate-100 rounded-lg p-1 border border-slate-200">
      {modes.map(({ key, label, Icon }) => {
        const isActive = activeMode === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onModeChange(key)}
            className={`flex-1 flex-row items-center justify-center gap-1 py-2 rounded-md ${
              isActive ? 'bg-indigo-600' : ''
            }`}
            activeOpacity={0.7}
          >
            <Icon
              size={14}
              color={isActive ? '#ffffff' : colors.slate[600]}
            />
            <Text
              className={`text-xs font-medium ${
                isActive ? 'text-white' : 'text-slate-600'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
