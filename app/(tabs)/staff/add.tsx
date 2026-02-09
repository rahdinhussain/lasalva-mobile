import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateStaff } from '@/hooks/useStaff';
import { StaffForm } from '@/components/forms';
import { Header } from '@/components/layout';

export default function AddStaffScreen() {
  const router = useRouter();
  const createStaff = useCreateStaff();

  const handleSubmit = async (data: any) => {
    await createStaff.mutateAsync({
      name: data.name,
      email: data.email,
      password: data.password,
      designation: data.designation || undefined,
      notify_appointments: data.notify_appointments,
      notify_shifts: data.notify_shifts,
      photo: data.photo,
    });
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Add Staff" showBack />
      <StaffForm
        onSubmit={handleSubmit}
        isLoading={createStaff.isPending}
      />
    </SafeAreaView>
  );
}
