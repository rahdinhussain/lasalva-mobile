import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Calendar, Clock, User } from 'lucide-react-native';
import { Service, AvailabilitySlot } from '@/types';
import { formatDate, formatInTimeZoneSafe } from '@/utils/dateUtils';
import { formatDuration } from '@/utils/formatters';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';

interface ConfirmationStepProps {
  service: Service;
  staffName: string | null;
  date: string;
  slot: AvailabilitySlot;
  customerName: string;
  onBookAnother: () => void;
  onClose: () => void;
  timeZone?: string | null;
  status?: 'PENDING' | 'CONFIRMED';
}

export function ConfirmationStep({
  service,
  staffName,
  date,
  slot,
  customerName,
  onBookAnother,
  onClose,
  timeZone,
  status = 'CONFIRMED',
}: ConfirmationStepProps) {
  const isConfirmed = status === 'CONFIRMED';
  return (
    <View className="flex-1 px-4 items-center">
      <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mt-4 mb-4">
        <CheckCircle size={36} color={colors.emerald[500]} />
      </View>

      <Text className="text-xl font-bold text-slate-900 mb-1">
        {isConfirmed ? 'Booking Confirmed!' : 'Booking Pending'}
      </Text>
      <Text className="text-sm text-slate-500 mb-6">
        {isConfirmed
          ? `Appointment booked for ${customerName}`
          : 'Your booking is pending confirmation by staff.'}
      </Text>

      <View className="bg-slate-50 rounded-xl p-4 w-full gap-3 mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <CheckCircle size={16} color={colors.indigo[600]} />
          </View>
          <View>
            <Text className="text-sm font-medium text-slate-900">{service.name}</Text>
            <Text className="text-xs text-slate-500">{formatDuration(service.duration_minutes)}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <Calendar size={16} color={colors.indigo[600]} />
          </View>
          <Text className="text-sm text-slate-700">
            {formatDate(date, 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <Clock size={16} color={colors.indigo[600]} />
          </View>
          <Text className="text-sm text-slate-700">
            {formatInTimeZoneSafe(slot.startTime, timeZone, 'h:mm a')} -{' '}
            {formatInTimeZoneSafe(slot.endTime, timeZone, 'h:mm a')}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <User size={16} color={colors.indigo[600]} />
          </View>
          <Text className="text-sm text-slate-700">
            {staffName ?? 'Any Available Staff'}
          </Text>
        </View>
      </View>

      <View className="w-full gap-3">
        <Button variant="secondary" fullWidth onPress={onBookAnother}>
          Book Another
        </Button>
        <Button variant="primary" fullWidth onPress={onClose}>
          Done
        </Button>
      </View>
    </View>
  );
}
