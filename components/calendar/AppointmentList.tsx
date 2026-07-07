import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { Search, Calendar, ChevronRight } from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Appointment, AppointmentStatus } from '@/types';
import { useBusiness } from '@/context/BusinessContext';
import { statusColors, getAppointmentColor, colors } from '@/constants/colors';
import {
  formatInTimeZoneSafe,
  getDateKeyInTimeZone,
  getDurationInMinutes,
} from '@/utils/dateUtils';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { SkeletonListItem, EmptyState, StatusBadge, SectionHeader } from '@/components/ui';
import { useSearchAppointments } from '@/hooks/useAppointments';
import { themeColor } from '@/utils/themeColor';

// Soft elevation for the timeline appointment cards.
const listCardShadow = {
  shadowColor: '#4338ca',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
} as const;

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentPress: (appointment: Appointment) => void;
  onRefresh: () => void;
  refreshing: boolean;
  timeZone?: string | null;
  useServerSearch?: boolean;
  rangeStart?: Date;
  rangeEnd?: Date;
}

type FilterOption = 'ALL' | AppointmentStatus;

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'NO_SHOW', label: 'No Show' },
];

interface Section {
  title: string;
  isToday: boolean;
  count: number;
  data: Appointment[];
}

export function AppointmentList({
  appointments,
  isLoading,
  onAppointmentPress,
  onRefresh,
  refreshing,
  timeZone,
  useServerSearch,
  rangeStart,
  rangeEnd,
}: AppointmentListProps) {
  const { business } = useBusiness();
  const businessId = business?.id;
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [listHeight, setListHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const shouldUseServerSearch = !!useServerSearch && !!businessId;
  const startDate = rangeStart ? getDateKeyInTimeZone(rangeStart, timeZone) : undefined;
  const endDate = rangeEnd ? getDateKeyInTimeZone(rangeEnd, timeZone) : undefined;

  const searchResult = useSearchAppointments({
    businessId: shouldUseServerSearch ? businessId! : '',
    status: activeFilter !== 'ALL' ? activeFilter : undefined,
    startDate,
    endDate,
    limit: 200,
    offset: 0,
    stats: shouldUseServerSearch,
  });

  const serverAppointments = searchResult.appointments ?? [];
  const baseAppointments = shouldUseServerSearch ? serverAppointments : safeAppointments;

  // Filter and search
  const filteredAppointments = useMemo(() => {
    let result = baseAppointments;

    if (!shouldUseServerSearch && activeFilter !== 'ALL') {
      result = result.filter((apt) => apt.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (apt) =>
          (apt.customer_name || '').toLowerCase().includes(query) ||
          (apt.service?.name || '').toLowerCase().includes(query) ||
          (apt.staff?.name || '').toLowerCase().includes(query) ||
          (apt.customer_email || '').toLowerCase().includes(query)
      );
    }

    // Sort newest first
    return result.sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  }, [baseAppointments, activeFilter, searchQuery, shouldUseServerSearch]);

  // Group by date
  const sections: Section[] = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    const order: string[] = [];
    const todayKey = getDateKeyInTimeZone(new Date(), timeZone);

    for (const apt of filteredAppointments) {
      const key = getDateKeyInTimeZone(apt.start_time, timeZone);
      if (!key) {
        continue;
      }
      if (!map[key]) {
        map[key] = [];
        order.push(key);
      }
      map[key].push(apt);
    }

    return order.map((key) => {
      const date = parseISO(key);
      const isToday = key === todayKey;
      const title = isToday
        ? `Today, ${format(date, 'MMM d, yyyy')}`
        : format(date, 'EEEE, MMM d, yyyy');
      return {
        title,
        isToday,
        count: map[key].length,
        data: map[key],
      };
    });
  }, [filteredAppointments, timeZone]);

  const renderAppointmentCard = useCallback(
    ({ item: apt }: { item: Appointment }) => {
      const statusStyle = statusColors[apt.status];
      const customerName = apt.customer_name || 'Walk-in';
      const serviceName = apt.service?.name || 'Service';
      const staffName = apt.staff?.name || 'Staff';
      const durationMin = getDurationInMinutes(apt.start_time, apt.end_time);
      const timeLabel = formatInTimeZoneSafe(apt.start_time, timeZone, 'h:mm a');

      return (
        <TouchableOpacity
          onPress={() => onAppointmentPress(apt)}
          className="mx-4 mb-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row items-stretch overflow-hidden"
          style={listCardShadow}
          activeOpacity={0.7}
        >
          {/* Colored status accent bar */}
          <View style={{ width: 4, backgroundColor: statusStyle.color }} />

          <View className="flex-1 flex-row items-center p-3">
            {/* Time column */}
            <View className="w-16 pr-2">
              <Text className="text-sm font-bold text-slate-900 dark:text-slate-50" numberOfLines={1}>
                {timeLabel}
              </Text>
              <Text className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5" numberOfLines={1}>
                {formatDuration(durationMin)}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1 pl-3 border-l border-slate-100 dark:border-slate-700">
              <Text
                className="text-sm font-semibold text-slate-900 dark:text-slate-50"
                numberOfLines={1}
              >
                {customerName}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={1}>
                {serviceName} · {staffName}
              </Text>
              <StatusBadge status={apt.status} size="sm" className="mt-1.5" />
            </View>

            {/* Chevron */}
            <ChevronRight size={18} color={themeColor().iconMuted} />
          </View>
        </TouchableOpacity>
      );
    },
    [onAppointmentPress]
  );

  const isLoadingList = shouldUseServerSearch ? searchResult.isLoading : isLoading;
  const listTopPadding = 8;
  const extraBottomPadding = Math.max(tabBarHeight, 72);
  const shouldHaveExtraPadding = contentHeight > listHeight;
  const listBottomPadding =
    listTopPadding + (shouldHaveExtraPadding ? extraBottomPadding : 0);

  if (isLoadingList) {
    return (
      <View className="flex-1 px-4 pt-4">
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search bar */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 px-4 min-h-[46px]">
          <Search size={18} color={themeColor().iconMuted} />
          <TextInput
            className="flex-1 ml-2 text-sm text-slate-900 dark:text-slate-50 py-2.5"
            placeholder="Search by name, service, or staff..."
            placeholderTextColor={themeColor().iconMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            style={Platform.OS === 'android' ? { paddingVertical: 10 } : undefined}
            {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
          />
        </View>
      </View>

      {/* Status filter chips */}
      <View className="pb-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 4,
            gap: 8,
          }}
        >
          {FILTER_OPTIONS.map(({ key, label }) => {
            const isActive = activeFilter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveFilter(key)}
                className={`w-24 h-9 rounded-full border items-center justify-center ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-medium leading-4 text-center ${
                    isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {shouldUseServerSearch && searchResult.statistics && (
        <View className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <Text className="text-xs text-slate-600 dark:text-slate-400">
            Total {searchResult.total ?? filteredAppointments.length} · Revenue{' '}
            {formatCurrency(searchResult.statistics.revenue ?? 0)} · Completion{' '}
            {Math.round((searchResult.statistics.completionRate ?? 0) * 100)}%
          </Text>
        </View>
      )}

      {/* Appointment list */}
      {sections.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} color={themeColor().iconMuted} />}
          title="No appointments"
          description={
            searchQuery || activeFilter !== 'ALL'
              ? 'No appointments match your search or filters'
              : 'No appointments found'
          }
          className="flex-1"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentCard}
          renderSectionHeader={({ section }) => (
            <View className="px-4 pt-3 pb-2 bg-slate-50 dark:bg-slate-900">
              <SectionHeader title={section.title} count={section.count} />
            </View>
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          className="flex-1"
          onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}
          onContentSizeChange={(_width, height) => setContentHeight(height)}
          contentContainerStyle={{
            paddingTop: listTopPadding,
            paddingBottom: listBottomPadding,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.indigo[600]}
            />
          }
        />
      )}
    </View>
  );
}
