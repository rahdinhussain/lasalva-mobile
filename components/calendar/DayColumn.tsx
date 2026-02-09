import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { Appointment } from '@/types';
import { AppointmentBlock } from './AppointmentBlock';
import { getDateKeyInTimeZone } from '@/utils/dateUtils';

interface DayColumnProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentPress: (appointment: Appointment) => void;
  timeZone?: string | null;
}

export function DayColumn({ date, appointments, onAppointmentPress, timeZone }: DayColumnProps) {
  const isToday =
    getDateKeyInTimeZone(date, timeZone) === getDateKeyInTimeZone(new Date(), timeZone);
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const dateKey = getDateKeyInTimeZone(date, timeZone);
  const dayAppointments = safeAppointments.filter((apt) =>
    getDateKeyInTimeZone(apt.start_time, timeZone) === dateKey
  );

  // Sort by start time
  dayAppointments.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <View className="flex-1 min-w-[100px]">
      {/* Day Header */}
      <View className={`items-center py-2 ${isToday ? 'bg-indigo-50' : 'bg-slate-50'}`}>
        <Text className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
          {format(date, 'EEE')}
        </Text>
        <View className={`mt-1 w-8 h-8 rounded-full items-center justify-center ${
          isToday ? 'bg-indigo-600' : ''
        }`}>
          <Text className={`text-sm font-semibold ${
            isToday ? 'text-white' : 'text-slate-900'
          }`}>
            {format(date, 'd')}
          </Text>
        </View>
      </View>

      {/* Appointments */}
      <ScrollView 
        className="flex-1 p-1"
        showsVerticalScrollIndicator={false}
      >
        {dayAppointments.length === 0 ? (
          <View className="items-center py-4">
            <Text className="text-xs text-slate-400">—</Text>
          </View>
        ) : (
          dayAppointments.map((apt) => (
            <AppointmentBlock
              key={apt.id}
              appointment={apt}
              onPress={onAppointmentPress}
              compact
              timeZone={timeZone}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
