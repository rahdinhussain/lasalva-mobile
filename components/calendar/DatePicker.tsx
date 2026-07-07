import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { colors } from '@/constants/colors';
import {
  getWeekRange,
  navigateWeek,
  navigateMonth,
  navigateDay,
  formatInTimeZoneSafe,
  getDateKeyInTimeZone,
  getNowInTimeZone,
} from '@/utils/dateUtils';
import type { ViewMode } from './ViewModeToggle';
import { themeColor } from '@/utils/themeColor';

interface DatePickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTodayPress: () => void;
  viewMode: ViewMode;
  appointmentCount?: number;
  timeZone?: string | null;
  /** Render for placement on the gradient hero (transparent, white text). */
  onHero?: boolean;
}

export function DatePicker({
  currentDate,
  onDateChange,
  onTodayPress,
  viewMode,
  appointmentCount,
  timeZone,
  onHero = false,
}: DatePickerProps) {
  const today = getNowInTimeZone(timeZone);

  const formatWeekRange = (): string => {
    const { start, end } = getWeekRange(currentDate);
    const startMonth = formatInTimeZoneSafe(start, timeZone, 'MMM');
    const endMonth = formatInTimeZoneSafe(end, timeZone, 'MMM');
    if (startMonth === endMonth) {
      return `${formatInTimeZoneSafe(start, timeZone, 'MMM d')} — ${formatInTimeZoneSafe(
        end,
        timeZone,
        'd'
      )}`;
    }
    return `${formatInTimeZoneSafe(start, timeZone, 'MMM d')} — ${formatInTimeZoneSafe(
      end,
      timeZone,
      'MMM d'
    )}`;
  };

  const getLabel = (): string => {
    switch (viewMode) {
      case 'month':
        return formatInTimeZoneSafe(currentDate, timeZone, 'MMMM yyyy');
      case 'week': {
        return formatWeekRange();
      }
      case 'day':
        return formatInTimeZoneSafe(currentDate, timeZone, 'EEEE, MMM d');
      case 'list':
        return '';
    }
  };

  const isOnCurrentPeriod = (): boolean => {
    switch (viewMode) {
      case 'month': {
        const currentMonth = formatInTimeZoneSafe(currentDate, timeZone, 'yyyy-MM');
        const todayMonth = formatInTimeZoneSafe(today, timeZone, 'yyyy-MM');
        return currentMonth === todayMonth;
      }
      case 'week': {
        const currentStart = getWeekRange(currentDate).start;
        const todayStart = getWeekRange(today).start;
        return (
          getDateKeyInTimeZone(currentStart, timeZone) ===
          getDateKeyInTimeZone(todayStart, timeZone)
        );
      }
      case 'day':
        return (
          getDateKeyInTimeZone(currentDate, timeZone) ===
          getDateKeyInTimeZone(today, timeZone)
        );
      case 'list':
        return true;
    }
  };

  const handlePrev = () => {
    switch (viewMode) {
      case 'month':
        onDateChange(navigateMonth(currentDate, 'prev'));
        break;
      case 'week':
        onDateChange(navigateWeek(currentDate, 'prev'));
        break;
      case 'day':
        onDateChange(navigateDay(currentDate, 'prev'));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'month':
        onDateChange(navigateMonth(currentDate, 'next'));
        break;
      case 'week':
        onDateChange(navigateWeek(currentDate, 'next'));
        break;
      case 'day':
        onDateChange(navigateDay(currentDate, 'next'));
        break;
    }
  };

  const showNavigation = viewMode !== 'list';
  const showToday = showNavigation && !isOnCurrentPeriod();

  const containerClass = onHero
    ? 'flex-row items-center justify-between'
    : 'flex-row items-center justify-between py-3 px-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800';
  const chevronColor = onHero ? '#ffffff' : themeColor().icon;
  const labelClass = onHero
    ? 'text-xl font-bold text-white'
    : 'text-lg font-semibold text-slate-900 dark:text-slate-50';
  const countPillClass = onHero
    ? 'bg-white/20 px-2 py-0.5 rounded-full'
    : 'bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full';
  const countTextClass = onHero
    ? 'text-xs font-semibold text-white'
    : 'text-xs font-medium text-indigo-600 dark:text-indigo-400';
  const todayPillClass = onHero
    ? 'bg-white/20 px-3 py-1 rounded-full'
    : 'bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1 rounded-full';
  const todayTextClass = onHero
    ? 'text-sm font-semibold text-white'
    : 'text-sm font-medium text-indigo-600 dark:text-indigo-400';

  return (
    <View className={containerClass}>
      {showNavigation ? (
        <TouchableOpacity
          onPress={handlePrev}
          className="p-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={chevronColor} />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}

      <View className="flex-row items-center gap-3">
        <Text className={labelClass}>{getLabel()}</Text>
        {viewMode === 'day' &&
          appointmentCount !== undefined &&
          appointmentCount > 0 && (
            <View className={countPillClass}>
              <Text className={countTextClass}>{appointmentCount}</Text>
            </View>
          )}
        {showToday && (
          <TouchableOpacity onPress={onTodayPress} className={todayPillClass}>
            <Text className={todayTextClass}>Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {showNavigation ? (
        <TouchableOpacity
          onPress={handleNext}
          className="p-2 -mr-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight size={24} color={chevronColor} />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
}
