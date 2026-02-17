import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Clock, DollarSign, Check } from 'lucide-react-native';
import { useServicesList } from '@/hooks/useServices';
import { Service } from '@/types';
import { formatCurrency, formatDuration, getInitials } from '@/utils/formatters';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

interface ServiceStepProps {
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  onNext: () => void;
}

function ServiceCard({
  service,
  isSelected,
  onPress,
}: {
  service: Service;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-white rounded-xl border p-3 flex-row items-center gap-3 ${
        isSelected ? 'border-2 border-indigo-600' : 'border-slate-200'
      }`}
    >
      {service.image_url ? (
        <View className="w-12 h-12 rounded-lg overflow-hidden">
          <Image
            source={{ uri: service.image_url }}
            style={{ width: 48, height: 48 }}
            contentFit="cover"
          />
        </View>
      ) : (
        <View className="w-12 h-12 rounded-lg bg-indigo-50 items-center justify-center">
          <Text className="text-indigo-600 font-semibold text-lg">
            {getInitials(service.name)}
          </Text>
        </View>
      )}

      <View className="flex-1">
        <Text className="text-base font-medium text-slate-900">{service.name}</Text>
        <View className="flex-row items-center gap-3 mt-1">
          <View className="flex-row items-center gap-1">
            <Clock size={13} color={colors.slate[400]} />
            <Text className="text-xs text-slate-500">
              {formatDuration(service.duration_minutes)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <DollarSign size={13} color={colors.slate[400]} />
            <Text className="text-xs text-slate-500">
              {formatCurrency(service.price)}
              {service.tax ? ` + ${service.tax}% tax` : ''}
            </Text>
          </View>
        </View>
      </View>

      {isSelected && (
        <View className="w-6 h-6 rounded-full bg-indigo-600 items-center justify-center">
          <Check size={14} color="#ffffff" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export function ServiceStep({ selectedService, onSelect, onNext }: ServiceStepProps) {
  const { activeServices, isLoading, error, refetch } = useServicesList();

  if (error) {
    return (
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <ErrorState message="Failed to load services" onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text className="text-lg font-semibold text-slate-900 mb-3">
        Select a Service
      </Text>

      {isLoading ? (
        <View className="gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : activeServices.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            title="No services available"
            description="Add services in the Services tab to start booking."
          />
        </View>
      ) : (
        <View style={{ flex: 1, minHeight: 200 }}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {activeServices.map((item) => (
              <View key={item.id} style={{ marginBottom: 10 }}>
                <ServiceCard
                  service={item}
                  isSelected={selectedService?.id === item.id}
                  onPress={() => onSelect(item)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="pt-4 pb-2">
        <Button
          variant="primary"
          fullWidth
          disabled={!selectedService}
          onPress={onNext}
        >
          Next
        </Button>
      </View>
    </View>
  );
}
