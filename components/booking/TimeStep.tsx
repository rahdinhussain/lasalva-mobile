import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useAvailabilitySlots } from '@/hooks/useBooking';
import { AvailabilitySlot } from '@/types';
import { formatDate, formatInTimeZoneSafe } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface TimeStepProps {
  serviceId: string;
  staffId: string | undefined;
  date: string;
  selectedSlot: AvailabilitySlot | null;
  onSlotSelect: (slot: AvailabilitySlot) => void;
  onNext: () => void;
  onBack: () => void;
  timeZone?: string | null;
}

export function TimeStep({
  serviceId,
  staffId,
  date,
  selectedSlot,
  onSlotSelect,
  onNext,
  onBack,
  timeZone,
}: TimeStepProps) {
  const { slots, isLoading, error, refetch } = useAvailabilitySlots(
    serviceId,
    date,
    staffId
  );

  const availableSlots = slots.filter((s) => s.available);

  return (
    <View className="flex-1 px-4">
      <Text className="text-lg font-semibold text-slate-900 mb-1">
        Select a Time
      </Text>
      <View className="flex-row items-center gap-1.5 mb-4">
        <Clock size={14} color={colors.slate[400]} />
        <Text className="text-sm text-slate-500">
          {formatDate(date, 'EEEE, MMMM d, yyyy')}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} width={88} height={44} borderRadius={22} />
          ))}
        </View>
      ) : error ? (
        <View className="items-center py-6">
          <Text className="text-sm text-rose-500 mb-2">Failed to load time slots</Text>
          <Button variant="secondary" size="sm" onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      ) : availableSlots.length === 0 ? (
        <EmptyState
          title="No available slots"
          description="Try selecting a different date or staff member."
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="flex-row flex-wrap gap-2.5">
            {slots.map((slot) => {
              const isAvailable = slot.available;
              const isSlotSelected = selectedSlot?.startTime === slot.startTime;

              return (
                <TouchableOpacity
                  key={slot.startTime}
                  disabled={!isAvailable}
                  onPress={() => onSlotSelect(slot)}
                  className={`px-4 py-3 rounded-xl border ${
                    isSlotSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : isAvailable
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-100 opacity-40'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSlotSelected
                        ? 'text-white'
                        : isAvailable
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatInTimeZoneSafe(slot.startTime, timeZone, 'h:mm a')}
                  </Text>
                  {isAvailable && slot.availableStaffCount > 1 && (
                    <Text
                      className={`text-xs text-center mt-0.5 ${
                        isSlotSelected ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {slot.availableStaffCount} staff
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View className="flex-row gap-3 pt-4 pb-2">
        <Button variant="secondary" onPress={onBack} className="flex-1">
          Back
        </Button>
        <Button
          variant="primary"
          disabled={!selectedSlot}
          onPress={onNext}
          className="flex-1"
        >
          Next
        </Button>
      </View>
    </View>
  );
}
