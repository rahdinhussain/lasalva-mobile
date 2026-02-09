import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Appointment } from '@/types';
import { formatInTimeZoneSafe, getDateKeyInTimeZone, getMonthGridDays } from '@/utils/dateUtils';
import { statusColors } from '@/constants/colors';
import { SkeletonCard } from '@/components/ui';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  isLoading: boolean;
  onDayPress: (date: Date, dayAppointments: Appointment[]) => void;
  timeZone?: string | null;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthView({
  currentDate,
  appointments,
  isLoading,
  onDayPress,
  timeZone,
}: MonthViewProps) {
  const gridDays = useMemo(() => getMonthGridDays(currentDate), [currentDate]);

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const currentMonthKey = formatInTimeZoneSafe(currentDate, timeZone, 'yyyy-MM');
  const todayKey = getDateKeyInTimeZone(new Date(), timeZone);

  // Group appointments by date string for fast lookup
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of safeAppointments) {
      const key = getDateKeyInTimeZone(apt.start_time, timeZone);
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    }
    // Sort each day's appointments by start time
    for (const key of Object.keys(map)) {
      map[key].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    }
    return map;
  }, [safeAppointments]);

  if (isLoading) {
    return (
      <View className="flex-1 p-4">
        <SkeletonCard className="mb-3" />
        <SkeletonCard className="mb-3" />
        <SkeletonCard />
      </View>
    );
  }

  // Split into 6 weeks of 7 days
  const weeks: Date[][] = [];
  for (let i = 0; i < 42; i += 7) {
    weeks.push(gridDays.slice(i, i + 7));
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Weekday headers */}
      <View className="flex-row border-b border-slate-100">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-2">
            <Text className="text-xs font-medium text-slate-500">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row border-b border-slate-100">
          {week.map((day) => {
            const dateKey = getDateKeyInTimeZone(day, timeZone);
            const dayAppts = appointmentsByDate[dateKey] || [];
            const isCurrentMonth = dateKey.startsWith(currentMonthKey);
            const isTodayDate = dateKey === todayKey;
            const displayDate = parseISO(dateKey);

            return (
              <TouchableOpacity
                key={dateKey}
                className={`flex-1 min-h-[80px] p-1 border-r border-slate-100 ${
                  isTodayDate
                    ? 'bg-indigo-50'
                    : isCurrentMonth
                    ? 'bg-white'
                    : 'bg-slate-50/50'
                }`}
                style={!isCurrentMonth ? { opacity: 0.4 } : undefined}
                activeOpacity={0.6}
                onPress={() => onDayPress(displayDate, dayAppts)}
              >
                {/* Date number */}
                <View className="items-start">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isTodayDate ? 'bg-indigo-600' : ''
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isTodayDate
                          ? 'text-white'
                          : isCurrentMonth
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(displayDate, 'd')}
                    </Text>
                  </View>
                </View>

                {/* Appointment indicators */}
                <View className="mt-1 gap-0.5">
                  {dayAppts.slice(0, 3).map((apt) => {
                    const statusStyle = statusColors[apt.status];
                    const initial = (apt.customer_name || 'W').charAt(0).toUpperCase();

                    return (
                      <View
                        key={apt.id}
                        className="rounded px-1 py-0.5"
                        style={{ backgroundColor: statusStyle.color }}
                      >
                        <Text
                          className="text-white font-bold"
                          style={{ fontSize: 9 }}
                          numberOfLines={1}
                        >
                          {initial}
                        </Text>
                      </View>
                    );
                  })}
                  {dayAppts.length > 3 && (
                    <Text
                      className="text-slate-500 font-medium"
                      style={{ fontSize: 9 }}
                    >
                      +{dayAppts.length - 3}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
