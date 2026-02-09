import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServicesList, useUpdateService } from '@/hooks/useServices';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { ServiceForm, ServiceFormData } from '@/components/forms';
import { Header } from '@/components/layout';
import { SkeletonCard, ErrorState } from '@/components/ui';

export default function EditServiceScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const { canManageServices } = useRoleAccess();
  const { services, isLoading, error, refetch } = useServicesList({
    includeInactive: canManageServices,
  });
  const updateService = useUpdateService();

  const service = services.find((s) => s.id === serviceId);

  const handleSubmit = async (data: ServiceFormData) => {
    await updateService.mutateAsync({
      id: serviceId,
      name: data.name,
      duration_minutes: data.duration_minutes,
      price: data.price ? parseFloat(data.price) : undefined,
      tax: data.tax ? parseFloat(data.tax) : undefined,
      deposit_required: data.deposit_required,
      deposit_amount: data.deposit_amount ? parseFloat(data.deposit_amount) : undefined,
      deposit_note: data.deposit_note || undefined,
      image: data.image,
    });
    router.back();
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Edit Service" showBack />
        <ErrorState message="Failed to load service details" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading || !service) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Edit Service" showBack />
        <View className="p-4">
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Edit Service" showBack />
      <ServiceForm
        initialData={service}
        isEditing
        onSubmit={handleSubmit}
        isLoading={updateService.isPending}
      />
    </SafeAreaView>
  );
}
