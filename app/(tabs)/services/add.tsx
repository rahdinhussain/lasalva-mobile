import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateService } from '@/hooks/useServices';
import { ServiceForm, ServiceFormData } from '@/components/forms';
import { Header } from '@/components/layout';

export default function AddServiceScreen() {
  const router = useRouter();
  const createService = useCreateService();

  const handleSubmit = async (data: ServiceFormData) => {
    await createService.mutateAsync({
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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Add Service" showBack />
      <ServiceForm
        onSubmit={handleSubmit}
        isLoading={createService.isPending}
      />
    </SafeAreaView>
  );
}
