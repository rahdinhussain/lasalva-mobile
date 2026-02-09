import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Briefcase, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useServicesList } from '@/hooks/useServices';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { ServiceCard } from '@/components/services';
import { IconButton, ErrorState, EmptyState, SkeletonCard } from '@/components/ui';
import { colors } from '@/constants/colors';

export default function ServicesListScreen() {
  const router = useRouter();
  const { canManageServices } = useRoleAccess();
  const { activeServices, inactiveServices, isLoading, error, refetch } = useServicesList({
    includeInactive: canManageServices,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddService = () => {
    router.push('/(tabs)/services/add');
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <Text className="text-2xl font-bold text-slate-900">Services</Text>
        </View>
        <ErrorState message="Failed to load services" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const hasInactive = inactiveServices.length > 0;
  const hasNoServices = activeServices.length === 0 && inactiveServices.length === 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <Text className="text-2xl font-bold text-slate-900">Services</Text>
        {canManageServices && (
          <IconButton
            icon={<Plus size={22} color={colors.indigo[600]} />}
            variant="ghost"
            onPress={handleAddService}
          />
        )}
      </View>

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
        </View>
      ) : hasNoServices ? (
        <EmptyState
          icon={<Briefcase size={48} color={colors.slate[300]} />}
          title="No services"
          description="Add services that customers can book"
          actionLabel={canManageServices ? 'Add Service' : undefined}
          onAction={canManageServices ? handleAddService : undefined}
          className="flex-1"
        />
      ) : (
        <FlatList
          data={activeServices}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View className="flex-1 p-2 max-w-[50%]">
              <ServiceCard service={item} />
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
          ListFooterComponent={
            hasInactive && canManageServices ? (
              <View className="mt-4">
                <TouchableOpacity
                  onPress={() => setShowInactive(!showInactive)}
                  className="flex-row items-center justify-between px-4 py-3 bg-slate-100 rounded-xl mx-2"
                >
                  <Text className="text-base font-medium text-slate-700">
                    Inactive Services ({inactiveServices.length})
                  </Text>
                  {showInactive ? (
                    <ChevronUp size={20} color={colors.slate[500]} />
                  ) : (
                    <ChevronDown size={20} color={colors.slate[500]} />
                  )}
                </TouchableOpacity>
                
                {showInactive && (
                  <View className="flex-row flex-wrap mt-2">
                    {inactiveServices.map((service) => (
                      <View key={service.id} className="w-1/2 p-2">
                        <ServiceCard service={service} />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
