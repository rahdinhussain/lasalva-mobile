import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Appointment } from '@/types';
import {
  formatInTimeZoneSafe,
  getDateKeyInTimeZone,
  getDurationInMinutes,
  getHoursMinutesInTimeZone,
  getWeekDays,
} from '@/utils/dateUtils';
import { statusColors, getAppointmentColor, colors } from '@/constants/colors';
import { TimeGrid, HOUR_HEIGHT, TIME_LABEL_WIDTH } from './TimeGrid';
import { SkeletonCard } from '@/components/ui';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentPress: (appointment: Appointment) => void;
  onDayPress?: (date: Date) => void;
  timeZone?: string | null;
}

// Calculate overlap lanes for appointments
function computeLanes(appointments: Appointment[]): Map<string, { lane: number; totalLanes: number }> {
  const result = new Map<string, { lane: number; totalLanes: number }>();
  if (appointments.length === 0) return result;

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Group overlapping appointments
  const groups: Appointment[][] = [];
  let currentGroup: Appointment[] = [sorted[0]];
  let groupEnd = new Date(sorted[0].end_time).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const aptStart = new Date(sorted[i].start_time).getTime();
    if (aptStart < groupEnd) {
      currentGroup.push(sorted[i]);
      groupEnd = Math.max(groupEnd, new Date(sorted[i].end_time).getTime());
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
      groupEnd = new Date(sorted[i].end_time).getTime();
    }
  }
  groups.push(currentGroup);

  // Assign lanes within each group
  for (const group of groups) {
    const totalLanes = group.length;
    group.forEach((apt, lane) => {
      result.set(apt.id, { lane, totalLanes });
    });
  }

  return result;
}

export function WeekView({
  currentDate,
  appointments,
  isLoading,
  onAppointmentPress,
  onDayPress,
  timeZone,
}: WeekViewProps) {
  const { width: screenWidth } = useWindowDimensions();
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const columnWidth = (screenWidth - TIME_LABEL_WIDTH) / 7;
  const todayKey = getDateKeyInTimeZone(new Date(), timeZone);

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const day of weekDays) {
      const key = getDateKeyInTimeZone(day, timeZone);
      map[key] = safeAppointments.filter(
        (apt) => getDateKeyInTimeZone(apt.start_time, timeZone) === key
      );
    }
    return map;
  }, [weekDays, safeAppointments, timeZone]);

  if (isLoading) {
    return (
      <View className="flex-1 p-4">
        <SkeletonCard className="mb-3" />
        <SkeletonCard className="mb-3" />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Day headers */}
      <View className="flex-row bg-white border-b border-slate-100">
        <View style={{ width: TIME_LABEL_WIDTH }} />
        {weekDays.map((day) => {
          const dayKey = getDateKeyInTimeZone(day, timeZone);
          const isTodayDate = dayKey === todayKey;
          const displayDate = parseISO(dayKey);
          return (
            <TouchableOpacity
              key={dayKey}
              style={{ width: columnWidth }}
              className="items-center py-2"
              activeOpacity={0.6}
              onPress={() => onDayPress?.(displayDate)}
            >
              <Text
                className={`text-xs font-medium ${
                  isTodayDate ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {format(displayDate, 'EEE')}
              </Text>
              <View
                className={`mt-1 w-7 h-7 rounded-full items-center justify-center ${
                  isTodayDate ? 'bg-indigo-600' : ''
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isTodayDate ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {format(displayDate, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time grid with appointment blocks */}
      <TimeGrid dates={weekDays} columnWidth={columnWidth} timeZone={timeZone}>
        {weekDays.map((day, dayIndex) => {
          const key = getDateKeyInTimeZone(day, timeZone);
          const dayAppts = appointmentsByDay[key] || [];
          const lanes = computeLanes(dayAppts);

          return dayAppts.map((apt) => {
            const { hours, minutes } = getHoursMinutesInTimeZone(apt.start_time, timeZone);
            const duration = getDurationInMinutes(apt.start_time, apt.end_time);
            const top = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
            const height = Math.max((duration / 60) * HOUR_HEIGHT, 20);

            const laneInfo = lanes.get(apt.id) || { lane: 0, totalLanes: 1 };
            const laneWidth = columnWidth / laneInfo.totalLanes;
            const left = dayIndex * columnWidth + laneInfo.lane * laneWidth;

            const statusStyle = statusColors[apt.status];
            const color = getAppointmentColor(apt.id);
            const customerName = apt.customer_name || 'Walk-in';

            return (
              <TouchableOpacity
                key={apt.id}
                className="absolute rounded overflow-hidden"
                style={{
                  top,
                  left: left + 1,
                  width: laneWidth - 2,
                  height: height - 1,
                  backgroundColor: color + '20',
                  borderLeftWidth: 3,
                  borderLeftColor: color,
                }}
                activeOpacity={0.7}
                onPress={() => onAppointmentPress(apt)}
              >
                <View className="px-1 py-0.5 flex-1">
                  <Text
                    className="text-slate-900 font-medium"
                    style={{ fontSize: 9 }}
                    numberOfLines={1}
                  >
                    {customerName}
                  </Text>
                  {height > 30 && (
                    <Text
                      className="text-slate-500"
                      style={{ fontSize: 8 }}
                      numberOfLines={1}
                    >
                      {formatInTimeZoneSafe(apt.start_time, timeZone, 'h:mm a')}
                    </Text>
                  )}
                </View>
                {/* Status dot */}
                <View
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: statusStyle.color }}
                />
              </TouchableOpacity>
            );
          });
        })}
      </TimeGrid>
    </View>
  );
}
