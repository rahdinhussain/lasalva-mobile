import React, { useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '@/hooks/useAppointments';
import { useBusiness } from '@/context/BusinessContext';
import { Appointment } from '@/types';
import {
  getMonthGridRange,
  getDateKeyInTimeZone,
  getNowInTimeZone,
} from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { ErrorState } from '@/components/ui';
import { BookingFAB, BookingModal } from '@/components/booking';
import {
  DatePicker,
  MonthView,
  WeekView,
  DayView,
  AppointmentList,
  AppointmentDetail,
  ViewModeToggle,
} from '@/components/calendar';
import type { ViewMode } from '@/components/calendar/ViewModeToggle';

/**
 * Returns the date range to fetch from the API.
 *
 * For month, week, and day views we always fetch the full month-grid range
 * (~42 days). This avoids timezone-offset issues with narrow single-day
 * queries and means navigating between days/weeks within the same month
 * doesn't trigger a new API call – each view component already filters
 * the appointments client-side by the exact date(s) it displays.
 */
function getFetchRange(date: Date, viewMode: ViewMode) {
  if (viewMode === 'list') {
    // Fetch a wide range for list view (3 months back, 3 months ahead)
    const start = new Date(date);
    start.setMonth(start.getMonth() - 3);
    const end = new Date(date);
    end.setMonth(end.getMonth() + 3);
    return { start, end };
  }
  // month / week / day — always use the broad month-grid range so that
  // day-view navigation never hits a stale or empty narrow-range cache.
  return getMonthGridRange(date);
}

export default function CalendarScreen() {
  const { business } = useBusiness();
  const timeZone = business?.timezone ?? null;
  const [currentDate, setCurrentDate] = useState(() => getNowInTimeZone(timeZone));

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  // Memoize the fetch range – the month-grid range only changes when the
  // current date crosses a month boundary, so navigating between days within
  // the same month reuses the already-fetched data.
  const fetchRange = useMemo(() => {
    const { start, end } = getFetchRange(currentDate, viewMode);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }, [currentDate, viewMode]);

  const { appointments, isLoading, error, refetch } = useAppointments(fetchRange);

  // Count appointments for the current day (used by DatePicker badge)
  const dayAppointmentCount = useMemo(() => {
    if (!appointments) return 0;
    const currentDateKey = getDateKeyInTimeZone(currentDate, timeZone);
    return appointments.filter(
      (apt) => getDateKeyInTimeZone(apt.start_time, timeZone) === currentDateKey
    ).length;
  }, [appointments, currentDate, timeZone]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToday = () => {
    setCurrentDate(getNowInTimeZone(timeZone));
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setSelectedAppointment(null), 300);
  };

  // Month view: tap a day
  const handleMonthDayPress = (date: Date, dayAppointments: Appointment[]) => {
    if (dayAppointments.length === 1) {
      handleAppointmentPress(dayAppointments[0]);
    } else if (dayAppointments.length > 1) {
      setCurrentDate(date);
      setViewMode('day');
    } else {
      setCurrentDate(date);
      setViewMode('day');
    }
  };

  // Week view: tap a day header to go to Day view
  const handleWeekDayPress = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <ErrorState
          message="Failed to load appointments"
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      {/* Header with view mode toggle */}
      <View className="px-4 py-3 bg-white border-b border-slate-100">
        <ViewModeToggle
          activeMode={viewMode}
          onModeChange={handleViewModeChange}
        />
      </View>

      {/* Date Picker / Navigation (hidden in list view) */}
      {viewMode !== 'list' && (
        <DatePicker
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onTodayPress={handleToday}
          viewMode={viewMode}
          timeZone={timeZone}
          appointmentCount={
            viewMode === 'day' ? dayAppointmentCount : undefined
          }
        />
      )}

      {/* Content */}
      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          appointments={appointments ?? []}
          isLoading={isLoading}
          onDayPress={handleMonthDayPress}
          timeZone={timeZone}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          currentDate={currentDate}
          appointments={appointments ?? []}
          isLoading={isLoading}
          onAppointmentPress={handleAppointmentPress}
          onDayPress={handleWeekDayPress}
          timeZone={timeZone}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          currentDate={currentDate}
          appointments={appointments ?? []}
          isLoading={isLoading}
          onAppointmentPress={handleAppointmentPress}
          timeZone={timeZone}
        />
      )}

      {viewMode === 'list' && (
        <AppointmentList
          appointments={appointments ?? []}
          isLoading={isLoading}
          onAppointmentPress={handleAppointmentPress}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          timeZone={timeZone}
          useServerSearch
          rangeStart={new Date(fetchRange.start)}
          rangeEnd={new Date(fetchRange.end)}
        />
      )}

      {/* Appointment Detail Modal */}
      <AppointmentDetail
        appointment={selectedAppointment}
        visible={detailVisible}
        onClose={handleCloseDetail}
        timeZone={timeZone}
      />

      {/* Booking FAB */}
      <BookingFAB onPress={() => setBookingVisible(true)} />

      {/* Booking Flow Modal */}
      <BookingModal
        visible={bookingVisible}
        onClose={() => setBookingVisible(false)}
        initialDate={currentDate}
      />
    </SafeAreaView>
  );
}
