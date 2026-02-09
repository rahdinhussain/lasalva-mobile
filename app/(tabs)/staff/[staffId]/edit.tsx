import React from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStaffDetail, useUpdateStaff } from '@/hooks/useStaff';
import { StaffForm } from '@/components/forms';
import { Header } from '@/components/layout';
import { SkeletonCard, ErrorState } from '@/components/ui';
import { View } from 'react-native';

export default function EditStaffScreen() {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const router = useRouter();
  const { staff, isLoading, error, refetch } = useStaffDetail(staffId);
  const updateStaff = useUpdateStaff();

  const handleSubmit = async (data: any) => {
    // Validate staffId
    if (!staffId || typeof staffId !== 'string') {
      Alert.alert('Error', 'Invalid staff ID');
      return;
    }
    
    const updateData: any = {
      name: data.name,
      email: data.email,
      designation: data.designation || null,
      notify_appointments: data.notify_appointments,
      notify_shifts: data.notify_shifts,
    };

    if (data.password) {
      updateData.password = data.password;
    }

    if (data.photo) {
      updateData.photo = data.photo;
    }

    await updateStaff.mutateAsync({ id: staffId, data: updateData });
    router.back();
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Edit Staff" showBack />
        <ErrorState message="Failed to load staff details" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading || !staff) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Edit Staff" showBack />
        <View className="p-4">
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Edit Staff" showBack />
      <StaffForm
        initialData={staff}
        isEditing
        onSubmit={handleSubmit}
        isLoading={updateStaff.isPending}
      />
    </SafeAreaView>
  );
}
