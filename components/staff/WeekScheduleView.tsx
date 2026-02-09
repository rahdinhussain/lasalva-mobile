import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { StaffShift } from '@/types';
import { useStaffShifts } from '@/hooks/useStaff';
import { 
  getWeekBounds, 
  getWeekDays, 
  navigateWeek, 
  formatDate,
  formatTimeToDisplay,
  toDateString,
  isTodayCheck,
} from '@/utils/dateUtils';
import { Card, Badge } from '@/components/ui';
import { colors } from '@/constants/colors';

interface WeekScheduleViewProps {
  staffId: string;
  staffName?: string;
}

const SHIFT_STYLE = { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Scheduled' };

export function WeekScheduleView({ staffId, staffName }: WeekScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get week bounds for API request
  const { startDate, endDate } = useMemo(() => getWeekBounds(currentDate), [currentDate]);
  
  // Get days of the week for display
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  
  // Fetch shifts for the current week
  const { shifts, isLoading, error, refetch } = useStaffShifts(staffId, startDate, endDate);
  
  // Create a map of date -> shift for easy lookup
  const shiftsByDate = useMemo(() => {
    const map: Record<string, StaffShift> = {};
    shifts.forEach(shift => {
      map[shift.shift_date] = shift;
    });
    return map;
  }, [shifts]);

  const handlePrevWeek = () => {
    setCurrentDate(prev => navigateWeek(prev, 'prev'));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => navigateWeek(prev, 'next'));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
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
          <Text className="text-base font-semibold text-slate-900 text-center">
            {weekRangeText}
          </Text>
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

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={colors.indigo[600]} />
          <Text className="text-sm text-slate-500 mt-3">Loading schedule...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-12 px-4">
          <Calendar size={48} color={colors.slate[300]} />
          <Text className="text-base font-medium text-slate-900 mt-4">
            Unable to load schedule
          </Text>
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
          {weekDays.map((day, index) => {
            const dateStr = toDateString(day);
            const shift = shiftsByDate[dateStr];
            const isToday = isTodayCheck(day);
            const dayName = formatDate(day, 'EEE');
            const dayDate = formatDate(day, 'MMM d');
            
            return (
              <Card 
                key={dateStr} 
                className={`p-4 mb-3 ${isToday ? 'border-indigo-300 border-2' : ''}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-12 items-center ${isToday ? 'opacity-100' : 'opacity-80'}`}>
                      <Text className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {dayName}
                      </Text>
                      <Text className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                        {formatDate(day, 'd')}
                      </Text>
                    </View>
                    
                    <View className="ml-4 flex-1">
                      {shift ? (
                        <View>
                          <Text className="text-base font-medium text-slate-900">
                            {formatTimeToDisplay(shift.start_time)} – {formatTimeToDisplay(shift.end_time)}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <ShiftBadge />
                          </View>
                        </View>
                      ) : (
                        <Text className="text-base text-slate-400">
                          No shift scheduled
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {isToday && (
                    <View className="bg-indigo-600 px-2 py-1 rounded">
                      <Text className="text-xs font-medium text-white">Today</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
          
          {/* Summary */}
          <View className="mt-2 p-4 bg-slate-50 rounded-xl">
            <Text className="text-sm font-medium text-slate-700 mb-2">
              Week Summary
            </Text>
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

// Shift badge component
function ShiftBadge() {
  return (
    <View className={`px-2 py-0.5 rounded ${SHIFT_STYLE.bg}`}>
      <Text className={`text-xs font-medium ${SHIFT_STYLE.text}`}>
        {SHIFT_STYLE.label}
      </Text>
    </View>
  );
}
