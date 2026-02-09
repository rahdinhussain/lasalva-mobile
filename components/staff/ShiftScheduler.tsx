import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, Calendar } from 'lucide-react-native';
import { StaffShift } from '@/types';
import { useStaffShifts, useCreateStaffShift, useDeleteStaffShift } from '@/hooks/useStaff';
import {
  getWeekBounds,
  getWeekDays,
  navigateWeek,
  formatDate,
  formatTimeToDisplay,
  toDateString,
  isTodayCheck,
  generateTimeSlots,
} from '@/utils/dateUtils';
import { Card, Select, Button } from '@/components/ui';
import { colors } from '@/constants/colors';

interface ShiftSchedulerProps {
  staffId: string;
  staffName?: string;
}

const timeOptions = generateTimeSlots(0, 24, 15).map((time) => ({
  label: formatTimeLabel(time),
  value: time,
}));

function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function ShiftScheduler({ staffId, staffName }: ShiftSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Get week bounds for API request
  const { startDate, endDate } = useMemo(() => getWeekBounds(currentDate), [currentDate]);

  // Get days of the week for display
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Fetch shifts for the current week
  const { shifts, isLoading, error, refetch } = useStaffShifts(staffId, startDate, endDate);

  // Mutations
  const createShift = useCreateStaffShift();
  const deleteShift = useDeleteStaffShift();

  // Create a map of date -> shift for easy lookup
  const shiftsByDate = useMemo(() => {
    const map: Record<string, StaffShift> = {};
    shifts.forEach((shift) => {
      map[shift.shift_date] = shift;
    });
    return map;
  }, [shifts]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => navigateWeek(prev, 'prev'));
    setSelectedDate(null);
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => navigateWeek(prev, 'next'));
    setSelectedDate(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const handleSelectDate = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
      // If there's an existing shift, pre-fill the times
      const existingShift = shiftsByDate[dateStr];
      if (existingShift) {
        setStartTime(existingShift.start_time);
        setEndTime(existingShift.end_time);
      } else {
        // Reset to defaults
        setStartTime('09:00');
        setEndTime('17:00');
      }
    }
  };

  const handleSaveShift = async () => {
    if (!selectedDate) return;

    try {
      const result = await createShift.mutateAsync({
        staffId,
        data: {
          shiftDate: selectedDate,
          startTime,
          endTime,
        },
      });

      const actionText = result.action === 'created' ? 'added' : 'updated';
      Alert.alert('Success', `Shift ${actionText} successfully`);
      setSelectedDate(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save shift');
    }
  };

  const handleDeleteShift = async (shiftId: string, shiftDate: string) => {
    Alert.alert(
      'Delete Shift',
      `Are you sure you want to delete the shift on ${formatDate(shiftDate, 'MMM d')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShift.mutateAsync({ staffId, shiftId });
              if (selectedDate === shiftDate) {
                setSelectedDate(null);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete shift');
            }
          },
        },
      ]
    );
  };

  // Format week range for header
  const weekRangeText = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = formatDate(start, 'MMM');
    const endMonth = formatDate(end, 'MMM');
    const year = formatDate(end, 'yyyy');

    if (startMonth === endMonth) {
      return `${formatDate(start, 'MMM d')} – ${formatDate(end, 'd')}, ${year}`;
    }
    return `${formatDate(start, 'MMM d')} – ${formatDate(end, 'MMM d')}, ${year}`;
  }, [weekDays]);

  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const { startDate: todayStart } = getWeekBounds(today);
    return startDate === todayStart;
  }, [startDate]);

  const isPastDate = (dateStr: string) => {
    const today = toDateString(new Date());
    return dateStr < today;
  };

  return (
    <View className="flex-1">
      {/* Week Navigation Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={handlePrevWeek}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft size={20} color={colors.slate[600]} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToday} className="flex-1 mx-3">
          <Text className="text-base font-semibold text-slate-900 text-center">{weekRangeText}</Text>
          {!isCurrentWeek && (
            <Text className="text-xs text-indigo-600 text-center mt-0.5">
              Tap to go to current week
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextWeek}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronRight size={20} color={colors.slate[600]} />
        </TouchableOpacity>
      </View>

      {/* Instruction text */}
      <View className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <Text className="text-sm text-slate-600">
          Tap a day to add or edit a one-time shift. Navigate weeks to schedule ahead.
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={colors.indigo[600]} />
          <Text className="text-sm text-slate-500 mt-3">Loading schedule...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-12 px-4">
          <Calendar size={48} color={colors.slate[300]} />
          <Text className="text-base font-medium text-slate-900 mt-4">Unable to load schedule</Text>
          <Text className="text-sm text-slate-500 mt-1 text-center">
            {error instanceof Error ? error.message : 'Please try again'}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {weekDays.map((day) => {
            const dateStr = toDateString(day);
            const shift = shiftsByDate[dateStr];
            const isToday = isTodayCheck(day);
            const isSelected = selectedDate === dateStr;
            const isPast = isPastDate(dateStr);
            const dayName = formatDate(day, 'EEE');

            return (
              <View key={dateStr}>
                <TouchableOpacity
                  onPress={() => !isPast && handleSelectDate(dateStr)}
                  disabled={isPast}
                  activeOpacity={isPast ? 1 : 0.7}
                >
                  <Card
                    className={`p-4 mb-2 ${
                      isSelected ? 'border-indigo-500 border-2' : isToday ? 'border-indigo-300 border' : ''
                    } ${isPast ? 'opacity-50' : ''}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className={`w-12 items-center ${isToday ? 'opacity-100' : 'opacity-80'}`}>
                          <Text
                            className={`text-xs font-medium ${
                              isToday ? 'text-indigo-600' : 'text-slate-500'
                            }`}
                          >
                            {dayName}
                          </Text>
                          <Text
                            className={`text-lg font-bold ${
                              isToday ? 'text-indigo-600' : 'text-slate-900'
                            }`}
                          >
                            {formatDate(day, 'd')}
                          </Text>
                        </View>

                        <View className="ml-4 flex-1">
                          {shift ? (
                            <View>
                              <Text className="text-base font-medium text-slate-900">
                                {formatTimeToDisplay(shift.start_time)} –{' '}
                                {formatTimeToDisplay(shift.end_time)}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                <View className="px-2 py-0.5 rounded bg-emerald-100">
                                  <Text className="text-xs font-medium text-emerald-700">
                                    Scheduled
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ) : (
                            <Text className="text-base text-slate-400">
                              {isPast ? 'Past date' : 'Tap to add shift'}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2">
                        {isToday && (
                          <View className="bg-indigo-600 px-2 py-1 rounded">
                            <Text className="text-xs font-medium text-white">Today</Text>
                          </View>
                        )}
                        {shift && !isPast && (
                          <TouchableOpacity
                            onPress={() => handleDeleteShift(shift.id, dateStr)}
                            className="w-8 h-8 items-center justify-center rounded-full bg-rose-50"
                            disabled={deleteShift.isPending}
                          >
                            <Trash2 size={16} color={colors.rose[500]} />
                          </TouchableOpacity>
                        )}
                        {!shift && !isPast && (
                          <View className="w-8 h-8 items-center justify-center rounded-full bg-indigo-50">
                            <Plus size={16} color={colors.indigo[500]} />
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>

                {/* Shift editor panel (shown when date is selected) */}
                {isSelected && (
                  <Card className="p-4 mb-3 bg-indigo-50 border-indigo-200">
                    <View className="flex-row items-center mb-3">
                      <Clock size={18} color={colors.indigo[600]} />
                      <Text className="ml-2 text-base font-semibold text-indigo-900">
                        {shift ? 'Edit Shift' : 'Add Shift'}
                      </Text>
                    </View>

                    <View className="flex-row gap-3 mb-4">
                      <View className="flex-1">
                        <Select
                          label="Start Time"
                          value={startTime}
                          options={timeOptions}
                          onChange={setStartTime}
                        />
                      </View>
                      <View className="flex-1">
                        <Select
                          label="End Time"
                          value={endTime}
                          options={timeOptions}
                          onChange={setEndTime}
                        />
                      </View>
                    </View>

                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Button
                          variant="secondary"
                          fullWidth
                          onPress={() => setSelectedDate(null)}
                        >
                          Cancel
                        </Button>
                      </View>
                      <View className="flex-1">
                        <Button
                          variant="primary"
                          fullWidth
                          loading={createShift.isPending}
                          onPress={handleSaveShift}
                        >
                          {shift ? 'Update' : 'Add'} Shift
                        </Button>
                      </View>
                    </View>
                  </Card>
                )}
              </View>
            );
          })}

          {/* Week Summary */}
          <View className="mt-2 p-4 bg-slate-50 rounded-xl">
            <Text className="text-sm font-medium text-slate-700 mb-2">Week Summary</Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-sm text-slate-600">
                  {shifts.length} shift{shifts.length !== 1 ? 's' : ''} scheduled
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-slate-300 mr-2" />
                <Text className="text-sm text-slate-600">
                  {7 - shifts.length} day{7 - shifts.length !== 1 ? 's' : ''} off
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
