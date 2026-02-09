import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { 
  Clock, 
  DollarSign, 
  Percent, 
  CreditCard, 
  FileText, 
  Users,
  Edit2, 
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react-native';
import { useServicesList, useServiceStaff, useDeleteService, useToggleServiceActive, useUpdateServiceStaff } from '@/hooks/useServices';
import { useBookingStaff } from '@/hooks/useBooking';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Header } from '@/components/layout';
import { AssignStaffDialog } from '@/components/services';
import { Card, Button, Avatar, Badge, ErrorState, SkeletonCard } from '@/components/ui';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import type { Profile } from '@/types';
import { colors } from '@/constants/colors';

export default function ServiceDetailScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const { canManageServices } = useRoleAccess();
  const { services, isLoading, error, refetch } = useServicesList({
    includeInactive: canManageServices,
  });
  const service = services.find((s) => s.id === serviceId);
  const { staff, isLoading: isServiceStaffLoading, refetch: refetchStaff } = useServiceStaff(serviceId);
  const {
    staff: publicStaff,
    isLoading: isPublicStaffLoading,
    refetch: refetchPublicStaff,
  } = useBookingStaff(service?.business_id, serviceId);
  type AssignedStaffDisplay = Pick<Profile, 'id' | 'name' | 'designation' | 'profile_photo_url'>;
  const staffFromQuery: AssignedStaffDisplay[] = Array.isArray(staff) ? staff : [];
  const staffFromService: AssignedStaffDisplay[] = (service?.assigned_staff ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    designation: null,
    profile_photo_url: s.profile_photo_url,
  }));
  const staffFromPublic: AssignedStaffDisplay[] = Array.isArray(publicStaff) ? publicStaff : [];
  const assignedStaff =
    staffFromQuery.length > 0 ? staffFromQuery : staffFromService.length > 0 ? staffFromService : staffFromPublic;
  const isStaffLoading = isServiceStaffLoading || isPublicStaffLoading;
  const deleteService = useDeleteService();
  const toggleActive = useToggleServiceActive();
  const updateStaff = useUpdateServiceStaff();
  
  const [showAssignStaff, setShowAssignStaff] = useState(false);

  const handleEdit = () => {
    router.push(`/(tabs)/services/${serviceId}/edit`);
  };

  const handleToggleActive = async () => {
    if (!service) return;
    try {
      await toggleActive.mutateAsync({
        serviceId,
        currentIsActive: service.is_active,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update service');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService.mutateAsync(serviceId);
              router.back();
            } catch (error: any) {
              const message =
                error?.response?.data?.error ||
                error?.message ||
                'Failed to delete service. Please try again.';
              Alert.alert("Can't delete service", message);
            }
          },
        },
      ]
    );
  };

  const handleSaveStaff = async (staffIds: string[]) => {
    try {
      await updateStaff.mutateAsync({ serviceId, staffIds });
      refetchStaff();
      refetchPublicStaff();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update staff assignments');
    }
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Service" showBack />
        <ErrorState message="Failed to load service details" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Service" showBack />
        <View className="p-4">
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Service" showBack />
        <ErrorState message="Service not found" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Service Details" showBack />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {service.image_url ? (
          <Image
            source={{ uri: service.image_url }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
          />
        ) : (
          <View 
            className="h-[200px] items-center justify-center"
            style={{ backgroundColor: colors.indigo[100] }}
          >
            <Text className="text-6xl text-indigo-300">
              {service.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="px-4 -mt-6">
          {/* Title Card */}
          <Card className="p-4 mb-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-xl font-semibold text-slate-900">
                  {service.name}
                </Text>
                <View className="flex-row items-center gap-2 mt-2">
                  {!service.is_active && (
                    <Badge variant="default">Inactive</Badge>
                  )}
                  {service.deposit_required && (
                    <Badge variant="warning">Deposit Required</Badge>
                  )}
                </View>
              </View>
            </View>
          </Card>

          {/* Details */}
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Details</Card.Title>
            </Card.Header>
            <Card.Content>
              <View className="gap-4">
                {/* Duration */}
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                    <Clock size={20} color={colors.slate[600]} />
                  </View>
                  <View>
                    <Text className="text-sm text-slate-500">Duration</Text>
                    <Text className="text-base font-medium text-slate-900">
                      {formatDuration(service.duration_minutes)}
                    </Text>
                  </View>
                </View>

                {/* Price */}
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                    <DollarSign size={20} color={colors.slate[600]} />
                  </View>
                  <View>
                    <Text className="text-sm text-slate-500">Price</Text>
                    <Text className="text-base font-medium text-slate-900">
                      {service.price ? formatCurrency(service.price) : '—'}
                    </Text>
                  </View>
                </View>

                {/* Tax */}
                {service.tax !== null && service.tax > 0 && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                      <Percent size={20} color={colors.slate[600]} />
                    </View>
                    <View>
                      <Text className="text-sm text-slate-500">Tax</Text>
                      <Text className="text-base font-medium text-slate-900">
                        {service.tax}%
                      </Text>
                    </View>
                  </View>
                )}

                {/* Deposit */}
                {service.deposit_required && (
                  <>
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center">
                        <CreditCard size={20} color={colors.amber[600]} />
                      </View>
                      <View>
                        <Text className="text-sm text-slate-500">Deposit Amount</Text>
                        <Text className="text-base font-medium text-slate-900">
                          {formatCurrency(service.deposit_amount || 0)}
                        </Text>
                      </View>
                    </View>
                    {service.deposit_note && (
                      <View className="flex-row items-start gap-3">
                        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                          <FileText size={20} color={colors.slate[600]} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-slate-500">Deposit Note</Text>
                          <Text className="text-base text-slate-900">
                            {service.deposit_note}
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Assigned Staff */}
          <Card className="mb-6" onPress={canManageServices ? () => setShowAssignStaff(true) : undefined}>
            <Card.Header>
              <View className="flex-row items-center justify-between">
                <Card.Title>Assigned Staff</Card.Title>
                {canManageServices && (
                  <Text className="text-sm text-indigo-600 font-medium">Manage</Text>
                )}
              </View>
            </Card.Header>
            <Card.Content>
              {isStaffLoading ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                    <Users size={20} color={colors.slate[400]} />
                  </View>
                  <Text className="text-base text-slate-500">
                    Loading staff...
                  </Text>
                </View>
              ) : assignedStaff.length === 0 ? (
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                    <Users size={20} color={colors.slate[400]} />
                  </View>
                  <Text className="text-base text-slate-500">
                    No staff assigned
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {assignedStaff.map((staff) => (
                    <View key={staff.id} className="flex-row items-center gap-3">
                      <Avatar source={staff.profile_photo_url} name={staff.name} size="md" />
                      <View>
                        <Text className="text-base font-medium text-slate-900">
                          {staff.name || 'Unnamed'}
                        </Text>
                        {staff.designation && (
                          <Text className="text-sm text-slate-500">{staff.designation}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Actions */}
          {canManageServices && (
            <View className="gap-3">
              <Button
                variant="secondary"
                fullWidth
                icon={<Edit2 size={18} color={colors.slate[700]} />}
                onPress={handleEdit}
              >
                Edit Service
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={service.is_active ? 
                  <PowerOff size={18} color={colors.amber[600]} /> : 
                  <Power size={18} color={colors.emerald[600]} />
                }
                onPress={handleToggleActive}
                loading={toggleActive.isPending}
              >
                {service.is_active ? 'Deactivate Service' : 'Activate Service'}
              </Button>
              <Button
                variant="destructive"
                fullWidth
                icon={<Trash2 size={18} color="white" />}
                onPress={handleDelete}
                loading={deleteService.isPending}
              >
                Delete Service
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Assign Staff Dialog */}
      <AssignStaffDialog
        visible={showAssignStaff}
        onClose={() => setShowAssignStaff(false)}
        assignedStaffIds={assignedStaff.map((s) => s.id)}
        onSave={handleSaveStaff}
      />
    </SafeAreaView>
  );
}
