import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CalendarPlus } from 'lucide-react-native';
import { useStaffDetail } from '@/hooks/useStaff';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { WeekScheduleView, ShiftScheduler } from '@/components/staff';
import { Header } from '@/components/layout';
import { colors } from '@/constants/colors';

type TabType = 'view' | 'schedule';

export default function StaffScheduleScreen() {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const { staff } = useStaffDetail(staffId);
  const { canManageStaff } = useRoleAccess();
  const [activeTab, setActiveTab] = useState<TabType>('view');

  const showManageTab = canManageStaff;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title={staff?.name ? `${staff.name}'s Schedule` : 'Schedule'} showBack />

      {/* Tab Switcher: staff sees only Week View (preview), admin sees both */}
      {showManageTab && (
        <View className="flex-row bg-white border-b border-slate-100 px-4 py-2">
          <TouchableOpacity
            onPress={() => setActiveTab('view')}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg mr-1 ${
              activeTab === 'view' ? 'bg-indigo-50' : 'bg-transparent'
            }`}
          >
            <Calendar
              size={18}
              color={activeTab === 'view' ? colors.indigo[600] : colors.slate[400]}
            />
            <Text className={`ml-2 font-medium ${
              activeTab === 'view' ? 'text-indigo-600' : 'text-slate-500'
            }`}>
              Week View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('schedule')}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ml-1 ${
              activeTab === 'schedule' ? 'bg-indigo-50' : 'bg-transparent'
            }`}
          >
            <CalendarPlus
              size={18}
              color={activeTab === 'schedule' ? colors.indigo[600] : colors.slate[400]}
            />
            <Text className={`ml-2 font-medium ${
              activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-500'
            }`}>
              Schedule
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Content: staff only sees preview (Week View) */}
      {activeTab === 'view' || !showManageTab ? (
        <WeekScheduleView staffId={staffId} staffName={staff?.name || undefined} />
      ) : (
        <ShiftScheduler staffId={staffId} staffName={staff?.name || undefined} />
      )}
    </SafeAreaView>
  );
}
