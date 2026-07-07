import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  CreditCard,
  ChevronRight,
  LogOut,
  Monitor,
  Sun,
  Moon,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useTheme, type ThemePreference } from '@/context/ThemeContext';
import { Card, Avatar, RoleBadge } from '@/components/ui';
import { GradientHeader } from '@/components/layout';
import { colors } from '@/constants/colors';
import { themeColor } from '@/utils/themeColor';

const THEME_OPTIONS: { value: ThemePreference; label: string; Icon: typeof Monitor }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

function AppearanceSelector() {
  const { preference, setPreference } = useTheme();

  return (
    <Card className="p-4 mb-6">
      <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
        Appearance
      </Text>
      <View className="flex-row bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
        {THEME_OPTIONS.map(({ value, label, Icon }) => {
          const isActive = preference === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setPreference(value)}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
                isActive ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
              }`}
            >
              <Icon
                size={16}
                color={isActive ? colors.indigo[500] : themeColor().iconMuted}
              />
              <Text
                className={`ml-1.5 text-sm font-medium ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
}

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
        destructive ? 'bg-rose-50 dark:bg-rose-500/20' : 'bg-slate-100 dark:bg-slate-800'
      }`}>
        {icon}
      </View>
      <Text className={`flex-1 text-base font-medium ml-3 ${
        destructive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'
      }`}>
        {label}
      </Text>
      {!destructive && <ChevronRight size={20} color={themeColor().iconMuted} />}
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
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <GradientHeader title="Settings" />

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
                <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {profile?.name || 'Your Profile'}
                </Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  {profile?.email || '—'}
                </Text>
                {profile?.role && (
                  <View className="mt-2">
                    <RoleBadge role={profile.role} />
                  </View>
                )}
              </View>
              <ChevronRight size={20} color={themeColor().iconMuted} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Appearance */}
        <AppearanceSelector />

        {/* Admin Menu Items */}
        {/* Note: Billing is hidden on iOS per App Store guidelines (3.1.1) - subscriptions managed via web */}
        {(canManageBusiness || (canViewBilling && Platform.OS !== 'ios')) && (
          <Card className="px-4 mb-6">
            {canManageBusiness && (
              <MenuItem
                icon={<Building2 size={20} color={themeColor().icon} />}
                label="Business"
                onPress={() => router.push('/(tabs)/settings/business')}
              />
            )}
            
            {canManageBusiness && canViewBilling && Platform.OS !== 'ios' && (
              <View className="h-px bg-slate-100 dark:bg-slate-800" />
            )}
            
            {canViewBilling && Platform.OS !== 'ios' && (
              <MenuItem
                icon={<CreditCard size={20} color={themeColor().icon} />}
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
