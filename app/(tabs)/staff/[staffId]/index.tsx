import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Briefcase, Calendar, Edit2, Trash2, Bell, BellOff } from 'lucide-react-native';
import { useStaffDetail, useDeleteStaff } from '@/hooks/useStaff';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Header } from '@/components/layout';
import { Avatar, Card, Button, RoleBadge, Badge, ErrorState, SkeletonCard } from '@/components/ui';
import { colors } from '@/constants/colors';

export default function StaffDetailScreen() {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const router = useRouter();
  const { staff, isLoading, error, refetch } = useStaffDetail(staffId);
  const { canManageStaff } = useRoleAccess();
  const deleteStaff = useDeleteStaff();

  const handleEdit = () => {
    router.push(`/(tabs)/staff/${staffId}/edit`);
  };

  const handleSchedule = () => {
    router.push(`/(tabs)/staff/${staffId}/schedule`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to delete ${staff?.name || 'this staff member'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStaff.mutateAsync(staffId);
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete staff member');
            }
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Staff" showBack />
        <ErrorState message="Failed to load staff details" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading || !staff) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Staff" showBack />
        <View className="p-4">
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Staff Details" showBack />
      
      <ScrollView 
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card className="p-6 items-center mb-4">
          <Avatar
            source={staff.profile_photo_url}
            name={staff.name}
            size="xl"
          />
          <Text className="text-xl font-semibold text-slate-900 mt-4 text-center">
            {staff.name || 'Unnamed'}
          </Text>
          {staff.designation && (
            <Text className="text-base text-slate-500 mt-1 text-center">
              {staff.designation}
            </Text>
          )}
          <View className="flex-row items-center gap-2 mt-3">
            <RoleBadge role={staff.role} size="md" />
            {!staff.is_active && (
              <Badge variant="default">Inactive</Badge>
            )}
          </View>
        </Card>

        {/* Contact Info */}
        <Card className="mb-4">
          <Card.Header>
            <Card.Title>Contact</Card.Title>
          </Card.Header>
          <Card.Content>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                <Mail size={20} color={colors.slate[600]} />
              </View>
              <View>
                <Text className="text-sm text-slate-500">Email</Text>
                <Text className="text-base text-slate-900">
                  {staff.email || '—'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card className="mb-4">
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
          </Card.Header>
          <Card.Content>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                {staff.notify_appointments ? (
                  <Bell size={20} color={colors.emerald[500]} />
                ) : (
                  <BellOff size={20} color={colors.slate[400]} />
                )}
                <Text className={`text-base ${staff.notify_appointments ? 'text-slate-900' : 'text-slate-400'}`}>
                  Appointment notifications {staff.notify_appointments ? 'enabled' : 'disabled'}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                {staff.notify_shifts ? (
                  <Bell size={20} color={colors.emerald[500]} />
                ) : (
                  <BellOff size={20} color={colors.slate[400]} />
                )}
                <Text className={`text-base ${staff.notify_shifts ? 'text-slate-900' : 'text-slate-400'}`}>
                  Shift notifications {staff.notify_shifts ? 'enabled' : 'disabled'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Schedule: staff can view, admin can view and manage */}
        <Card className="mb-6" onPress={handleSchedule}>
          <Card.Header>
            <View className="flex-row items-center justify-between">
              <Card.Title>Schedule</Card.Title>
              {canManageStaff && (
                <Text className="text-sm text-indigo-600 font-medium">Manage</Text>
              )}
            </View>
          </Card.Header>
          <Card.Content>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center">
                <Calendar size={20} color={colors.indigo[600]} />
              </View>
              <Text className="text-base text-slate-900">
                {canManageStaff ? 'View and manage weekly schedule' : 'View weekly schedule'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        {canManageStaff && (
          <View className="gap-3">
            <Button
              variant="secondary"
              fullWidth
              icon={<Edit2 size={18} color={colors.slate[700]} />}
              onPress={handleEdit}
            >
              Edit Staff
            </Button>
            <Button
              variant="destructive"
              fullWidth
              icon={<Trash2 size={18} color="white" />}
              onPress={handleDelete}
              loading={deleteStaff.isPending}
            >
              Delete Staff
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
