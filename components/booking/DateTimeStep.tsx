import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { format, parseISO, startOfDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react-native';
import { useAvailabilitySlots } from '@/hooks/useBooking';
import { useBusiness } from '@/context/BusinessContext';
import { AvailabilitySlot, BusinessHour } from '@/types';
import {
  formatInTimeZoneSafe,
  getDateKeyInTimeZone,
  getNowInTimeZone,
  getMonthGridDays,
  toTimeZoneDate,
} from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface DateTimeStepProps {
  serviceId: string;
  staffId: string | undefined;
  selectedDate: string | null;
  selectedSlot: AvailabilitySlot | null;
  onDateSelect: (date: string) => void;
  onSlotSelect: (slot: AvailabilitySlot) => void;
  onNext: () => void;
  onBack: () => void;
  timeZone?: string | null;
  nextLabel?: string;
  isSubmitting?: boolean;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isDayClosed(date: Date, businessHours: BusinessHour[], timeZone?: string | null): boolean {
  const dayOfWeek = toTimeZoneDate(date, timeZone).getDay(); // 0=Sunday
  const hours = businessHours.find((h) => h.day_of_week === dayOfWeek);
  if (!hours) return false;
  return hours.is_closed === true;
}

export function DateTimeStep({
  serviceId,
  staffId,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
  onNext,
  onBack,
  timeZone,
  nextLabel = 'Next',
  isSubmitting = false,
}: DateTimeStepProps) {
  const { businessHours } = useBusiness();
  const { slots, isLoading: slotsLoading, error: slotsError, refetch } = useAvailabilitySlots(
    serviceId,
    selectedDate ?? undefined,
    staffId
  );

  const today = startOfDay(getNowInTimeZone(timeZone));
  const [calendarMonth, setCalendarMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const gridDays = useMemo(() => getMonthGridDays(calendarMonth), [calendarMonth]);
  const todayKey = getDateKeyInTimeZone(new Date(), timeZone);
  const currentMonthKey = formatInTimeZoneSafe(calendarMonth, timeZone, 'yyyy-MM');

  // Split into 6 weeks of 7 days
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < 42; i += 7) {
      result.push(gridDays.slice(i, i + 7));
    }
    return result;
  }, [gridDays]);

  const availableSlots = slots.filter((s) => s.available);

  const handlePrevMonth = () => setCalendarMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCalendarMonth((prev) => addMonths(prev, 1));

  const isCurrentMonth =
    formatInTimeZoneSafe(calendarMonth, timeZone, 'yyyy-MM') ===
    formatInTimeZoneSafe(today, timeZone, 'yyyy-MM');

  return (
    <View className="flex-1 px-4">
      <Text className="text-lg font-semibold text-slate-900 mb-3">
        Pick a Date & Time
      </Text>

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={handlePrevMonth}
          disabled={isCurrentMonth}
          className="p-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft
            size={22}
            color={isCurrentMonth ? colors.slate[300] : colors.slate[700]}
          />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-slate-900">
            {formatInTimeZoneSafe(calendarMonth, timeZone, 'MMMM yyyy')}
          </Text>
          {!isCurrentMonth && (
            <TouchableOpacity
              onPress={() => setCalendarMonth(new Date())}
              className="bg-indigo-50 px-2.5 py-0.5 rounded-full"
            >
              <Text className="text-xs font-medium text-indigo-600">Today</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          className="p-2 -mr-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight size={22} color={colors.slate[700]} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View className="flex-row border-b border-slate-100">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-1.5">
            <Text className="text-xs font-medium text-slate-500">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row">
          {week.map((day) => {
            const dateStr = getDateKeyInTimeZone(day, timeZone);
            const inCurrentMonth = dateStr.startsWith(currentMonthKey);
            const isPast = dateStr < todayKey;
            const isClosed = isDayClosed(day, businessHours, timeZone);
            const isDisabled = !inCurrentMonth || isPast || isClosed;
            const isTodayDate = dateStr === todayKey;
            const isSelected = selectedDate === dateStr;
            const displayDate = parseISO(dateStr);

            return (
              <TouchableOpacity
                key={dateStr}
                disabled={isDisabled}
                onPress={() => onDateSelect(dateStr)}
                activeOpacity={0.6}
                className="flex-1 items-center py-2"
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600'
                      : isTodayDate && inCurrentMonth
                      ? 'bg-indigo-50'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? 'text-white'
                        : isTodayDate && inCurrentMonth
                        ? 'text-indigo-600 font-semibold'
                        : isDisabled
                        ? 'text-slate-300'
                        : 'text-slate-900'
                    }`}
                  >
                    {format(displayDate, 'd')}
                  </Text>
                </View>
                {isClosed && inCurrentMonth && !isPast && (
                  <View className="w-1 h-1 rounded-full bg-rose-400 mt-0.5" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Time Slots */}
      <View className="mt-3 border-t border-slate-100 pt-3">
        {!selectedDate ? (
          <View className="items-center py-4">
            <CalendarDays size={28} color={colors.slate[300]} />
            <Text className="text-sm text-slate-400 mt-2">
              Select a date to see available times
            </Text>
          </View>
        ) : slotsLoading ? (
          <View className="flex-row flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} width={80} height={40} borderRadius={20} />
            ))}
          </View>
        ) : slotsError ? (
          <View className="items-center py-4">
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 160 }}
          >
            <View className="flex-row flex-wrap gap-2">
              {slots.map((slot) => {
                const isAvailable = slot.available;
                const isSlotSelected = selectedSlot?.startTime === slot.startTime;

                return (
                  <TouchableOpacity
                    key={slot.startTime}
                    disabled={!isAvailable}
                    onPress={() => onSlotSelect(slot)}
                    className={`px-4 py-2.5 rounded-full border ${
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
                        className={`text-xs text-center ${
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
      </View>

      <View className="flex-row gap-3 pt-4 pb-2">
        <Button
          variant="secondary"
          onPress={onBack}
          className="flex-1"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          variant="primary"
          disabled={!selectedSlot || isSubmitting}
          onPress={onNext}
          className="flex-1"
          loading={isSubmitting}
        >
          {nextLabel}
        </Button>
      </View>
    </View>
  );
}
