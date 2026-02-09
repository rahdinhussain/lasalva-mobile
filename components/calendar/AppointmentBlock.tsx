import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Appointment } from '@/types';
import { formatInTimeZoneSafe, getDurationInMinutes } from '@/utils/dateUtils';
import { getAppointmentColor, statusColors } from '@/constants/colors';

const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;
const isTerminalStatus = (status: string) =>
  TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number]);

interface AppointmentBlockProps {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
  compact?: boolean;
  timeZone?: string | null;
}

export function AppointmentBlock({
  appointment,
  onPress,
  compact = false,
  timeZone,
}: AppointmentBlockProps) {
  const color = getAppointmentColor(appointment.id);
  const duration = getDurationInMinutes(appointment.start_time, appointment.end_time);
  const statusStyle = statusColors[appointment.status];
  const isTerminal = isTerminalStatus(appointment.status);

  const customerName = appointment.customer_name || 'Walk-in';
  const serviceName = appointment.service?.name || 'Service';
  const timeLabel = formatInTimeZoneSafe(appointment.start_time, timeZone, 'h:mm a');

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onPress(appointment)}
        className={`rounded-lg px-2 py-1 mb-1 overflow-hidden ${isTerminal ? 'opacity-75' : ''}`}
        style={{ backgroundColor: color + '20', borderLeftWidth: 3, borderLeftColor: color }}
        activeOpacity={0.7}
      >
        <Text className="text-xs font-medium text-slate-900" numberOfLines={1}>
          {timeLabel}
        </Text>
        <Text className="text-xs text-slate-600" numberOfLines={1}>
          {customerName}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(appointment)}
      className={`rounded-xl p-3 mb-2 overflow-hidden ${isTerminal ? 'opacity-80' : ''}`}
      style={{ backgroundColor: color + '15', borderLeftWidth: 4, borderLeftColor: color }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
            {customerName}
          </Text>
          <Text className="text-xs text-slate-600 mt-0.5" numberOfLines={1}>
            {serviceName} • {duration} min
          </Text>
          <Text className="text-xs text-slate-500 mt-1">
            {timeLabel}
          </Text>
        </View>
        <View className={`px-2 py-0.5 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-xs font-medium ${statusStyle.text}`}>
            {appointment.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
