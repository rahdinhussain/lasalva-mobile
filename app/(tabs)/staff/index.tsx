import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users } from 'lucide-react-native';
import { useStaffList, useStaffWeekSchedules } from '@/hooks/useStaff';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { StaffCard } from '@/components/staff';
import { IconButton, ErrorState, EmptyState, SkeletonCard } from '@/components/ui';
import { GradientHeader } from '@/components/layout';
import { colors } from '@/constants/colors';
import { themeColor } from '@/utils/themeColor';

export default function StaffListScreen() {
  const router = useRouter();
  const { staff, isLoading, error, refetch } = useStaffList();
  const { canManageStaff, isStaff } = useRoleAccess();
  const staffIds = staff.map((s) => s.id);
  const { scheduleByStaffId } = useStaffWeekSchedules(isStaff ? staffIds : [], isStaff);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddStaff = () => {
    router.push('/(tabs)/staff/add');
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50 dark:bg-slate-900">
        <GradientHeader title="Staff" />
        <ErrorState message="Failed to load staff" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <GradientHeader
        title="Staff"
        rightContent={
          canManageStaff ? (
            <IconButton
              icon={<Plus size={22} color="#ffffff" />}
              variant="ghost"
              onPress={handleAddStaff}
            />
          ) : undefined
        }
      />

      {isLoading ? (
        <View className="flex-1 p-4">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <SkeletonCard />
            </View>
            <View className="flex-1">
              <SkeletonCard />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <SkeletonCard />
            </View>
            <View className="flex-1">
              <SkeletonCard />
            </View>
          </View>
        </View>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<Users size={48} color={themeColor().iconMuted} />}
          title="No staff members"
          description="Add staff members to manage your team"
          actionLabel={canManageStaff ? 'Add Staff' : undefined}
          onAction={canManageStaff ? handleAddStaff : undefined}
          className="flex-1"
        />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View className="flex-1 p-2 max-w-[50%]">
              <StaffCard
                staff={item}
                weekSchedule={isStaff ? scheduleByStaffId[item.id] : undefined}
              />
            </View>
          )}
          contentContainerStyle={{ padding: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.indigo[600]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
