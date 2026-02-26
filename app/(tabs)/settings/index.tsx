import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Building2, 
  CreditCard, 
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Card, Avatar, RoleBadge, Logo } from '@/components/ui';
import { colors } from '@/constants/colors';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, onPress, destructive = false }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3"
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center ${
        destructive ? 'bg-rose-50' : 'bg-slate-100'
      }`}>
        {icon}
      </View>
      <Text className={`flex-1 text-base font-medium ml-3 ${
        destructive ? 'text-rose-600' : 'text-slate-900'
      }`}>
        {label}
      </Text>
      {!destructive && <ChevronRight size={20} color={colors.slate[400]} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user: profile } = useAuth();
  const { canManageBusiness, canViewBilling } = useRoleAccess();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <Logo size="sm" className="mr-3" />
        <Text className="text-2xl font-bold text-slate-900">Settings</Text>
      </View>

      <View className="flex-1 px-4 py-4">
        {/* Profile Card */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings/profile')}>
          <Card className="p-4 mb-6">
            <View className="flex-row items-center">
              <Avatar
                source={profile?.profile_photo_url}
                name={profile?.name}
                size="lg"
              />
              <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold text-slate-900">
                  {profile?.name || 'Your Profile'}
                </Text>
                <Text className="text-sm text-slate-500">
                  {profile?.email || '—'}
                </Text>
                {profile?.role && (
                  <View className="mt-2">
                    <RoleBadge role={profile.role} />
                  </View>
                )}
              </View>
              <ChevronRight size={20} color={colors.slate[400]} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Admin Menu Items */}
        {/* Note: Billing is hidden on iOS per App Store guidelines (3.1.1) - subscriptions managed via web */}
        {(canManageBusiness || (canViewBilling && Platform.OS !== 'ios')) && (
          <Card className="px-4 mb-6">
            {canManageBusiness && (
              <MenuItem
                icon={<Building2 size={20} color={colors.slate[600]} />}
                label="Business"
                onPress={() => router.push('/(tabs)/settings/business')}
              />
            )}
            
            {canManageBusiness && canViewBilling && Platform.OS !== 'ios' && (
              <View className="h-px bg-slate-100" />
            )}
            
            {canViewBilling && Platform.OS !== 'ios' && (
              <MenuItem
                icon={<CreditCard size={20} color={colors.slate[600]} />}
                label="Billing"
                onPress={() => router.push('/(tabs)/settings/billing')}
              />
            )}
          </Card>
        )}

        {/* Sign Out */}
        <Card className="px-4">
          <MenuItem
            icon={<LogOut size={20} color={colors.rose[600]} />}
            label="Sign Out"
            onPress={handleLogout}
            destructive
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
