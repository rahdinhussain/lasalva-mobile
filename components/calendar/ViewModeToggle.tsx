import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Grid3X3, CalendarDays, Clock, List } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { themeColor } from '@/utils/themeColor';

export type ViewMode = 'month' | 'week' | 'day' | 'list';

interface ViewModeToggleProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  /** Render for placement on the gradient hero (translucent, white text). */
  onHero?: boolean;
}

const modes: { key: ViewMode; label: string; Icon: typeof Grid3X3 }[] = [
  { key: 'month', label: 'Month', Icon: Grid3X3 },
  { key: 'week', label: 'Week', Icon: CalendarDays },
  { key: 'day', label: 'Day', Icon: Clock },
  { key: 'list', label: 'List', Icon: List },
];

export function ViewModeToggle({ activeMode, onModeChange, onHero = false }: ViewModeToggleProps) {
  const containerClass = onHero
    ? 'flex-row bg-white/15 rounded-full p-1'
    : 'flex-row bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700';

  return (
    <View className={containerClass}>
      {modes.map(({ key, label, Icon }) => {
        const isActive = activeMode === key;
        const activePillClass = onHero ? 'bg-white' : 'bg-indigo-600';
        const iconColor = isActive
          ? onHero
            ? '#4f46e5'
            : '#ffffff'
          : onHero
          ? '#ffffff'
          : themeColor().icon;
        const labelClass = isActive
          ? onHero
            ? 'text-indigo-600'
            : 'text-white'
          : onHero
          ? 'text-white'
          : 'text-slate-600 dark:text-slate-400';
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onModeChange(key)}
            className={`flex-1 flex-row items-center justify-center gap-1 py-2 rounded-full ${
              isActive ? activePillClass : ''
            }`}
            activeOpacity={0.7}
          >
            <Icon size={14} color={iconColor} />
            <Text className={`text-xs font-semibold ${labelClass}`}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
