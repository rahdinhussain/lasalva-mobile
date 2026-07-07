import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface SectionHeaderProps {
  /** Small accent label, e.g. "TODAY". Rendered uppercase in the brand color. */
  label?: string;
  /** Main title text next to the label. */
  title?: string;
  /** Optional count shown as a subtle pill. */
  count?: number;
  /** Optional right-side action (e.g. "See all"). */
  actionLabel?: string;
  onAction?: () => void;
  right?: ReactNode;
  className?: string;
}

/**
 * Section title row used above lists: "TODAY · 3 Activities · See all".
 * Presentational only.
 */
export function SectionHeader({
  label,
  title,
  count,
  actionLabel,
  onAction,
  right,
  className = '',
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <View className="flex-row items-center gap-2 flex-1">
        {label && (
          <Text className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            {label}
          </Text>
        )}
        {title && (
          <Text className="text-base font-semibold text-slate-900 dark:text-slate-50" numberOfLines={1}>
            {title}
          </Text>
        )}
        {count !== undefined && (
          <View className="bg-indigo-50 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {count}
            </Text>
          </View>
        )}
      </View>
      {right}
      {!right && actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="flex-row items-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-0.5">
            {actionLabel}
          </Text>
          <ChevronRight size={16} color={colors.indigo[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}
