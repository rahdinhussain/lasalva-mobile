import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Appointment } from '@/types';
import {
  formatInTimeZoneSafe,
  getDateKeyInTimeZone,
  getDurationInMinutes,
  getHoursMinutesInTimeZone,
} from '@/utils/dateUtils';
import { statusColors, getAppointmentColor } from '@/constants/colors';
import { TimeGrid, HOUR_HEIGHT, TIME_LABEL_WIDTH } from './TimeGrid';
import { SkeletonCard, EmptyState } from '@/components/ui';
import { Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { formatDuration } from '@/utils/formatters';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentPress: (appointment: Appointment) => void;
  timeZone?: string | null;
}

// Calculate overlap lanes
function computeLanes(appointments: Appointment[]): Map<string, { lane: number; totalLanes: number }> {
  const result = new Map<string, { lane: number; totalLanes: number }>();
  if (appointments.length === 0) return result;

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

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

  for (const group of groups) {
    const totalLanes = group.length;
    group.forEach((apt, lane) => {
      result.set(apt.id, { lane, totalLanes });
    });
  }

  return result;
}

export function DayView({
  currentDate,
  appointments,
  isLoading,
  onAppointmentPress,
  timeZone,
}: DayViewProps) {
  const { width: screenWidth } = useWindowDimensions();
  const gridWidth = screenWidth - TIME_LABEL_WIDTH;
  const currentDateKey = getDateKeyInTimeZone(currentDate, timeZone);

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const dayAppointments = useMemo(
    () =>
      safeAppointments
        .filter((apt) => getDateKeyInTimeZone(apt.start_time, timeZone) === currentDateKey)
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ),
    [safeAppointments, currentDateKey, timeZone]
  );

  const lanes = useMemo(() => computeLanes(dayAppointments), [dayAppointments]);

  if (isLoading) {
    return (
      <View className="flex-1 p-4">
        <SkeletonCard className="mb-3" />
        <SkeletonCard className="mb-3" />
        <SkeletonCard />
      </View>
    );
  }

  if (dayAppointments.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={48} color={colors.slate[300]} />}
        title="No appointments"
        description={`No appointments on ${format(parseISO(currentDateKey), 'EEEE, MMM d')}`}
        className="flex-1"
      />
    );
  }

  return (
    <TimeGrid dates={[currentDate]} timeZone={timeZone}>
      {dayAppointments.map((apt) => {
        const { hours, minutes } = getHoursMinutesInTimeZone(apt.start_time, timeZone);
        const durationMin = getDurationInMinutes(apt.start_time, apt.end_time);
        const top = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
        const height = Math.max((durationMin / 60) * HOUR_HEIGHT, 28);

        const laneInfo = lanes.get(apt.id) || { lane: 0, totalLanes: 1 };
        const laneWidth = gridWidth / laneInfo.totalLanes;
        const left = laneInfo.lane * laneWidth;

        const statusStyle = statusColors[apt.status];
        const color = getAppointmentColor(apt.id);
        const customerName = apt.customer_name || 'Walk-in';
        const serviceName = apt.service?.name || 'Service';

        return (
          <TouchableOpacity
            key={apt.id}
            className="absolute rounded-lg overflow-hidden"
            style={{
              top,
              left: left + 2,
              width: laneWidth - 4,
              height: height - 2,
              backgroundColor: color + '15',
              borderLeftWidth: 4,
              borderLeftColor: color,
            }}
            activeOpacity={0.7}
            onPress={() => onAppointmentPress(apt)}
          >
            <View className="px-2 py-1 flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-sm font-semibold text-slate-900 flex-1"
                  numberOfLines={1}
                >
                  {customerName}
                </Text>
                <View
                  className={`px-1.5 py-0.5 rounded-full ml-1 ${statusStyle.bg}`}
                >
                  <Text className={`font-medium ${statusStyle.text}`} style={{ fontSize: 9 }}>
                    {apt.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              {height > 40 && (
                <Text className="text-xs text-slate-600 mt-0.5" numberOfLines={1}>
                  {serviceName}
                </Text>
              )}
              {height > 55 && (
                <Text className="text-xs text-slate-500 mt-0.5">
                  {formatInTimeZoneSafe(apt.start_time, timeZone, 'h:mm a')} ·{' '}
                  {formatDuration(durationMin)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </TimeGrid>
  );
}
