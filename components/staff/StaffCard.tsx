import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Profile } from '@/types';
import { Avatar, RoleBadge, Card } from '@/components/ui';
import { DAY_NAMES_SHORT } from '@/constants';

interface StaffCardProps {
  staff: Profile;
  weekSchedule?: Record<number, boolean>;
}

export function StaffCard({ staff, weekSchedule }: StaffCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(tabs)/staff/${staff.id}`);
  };

  return (
    <Card onPress={handlePress} className="p-4">
      <View className="items-center">
        <Avatar
          source={staff.profile_photo_url}
          name={staff.name}
          size="lg"
        />
        <Text className="text-base font-semibold text-slate-900 mt-3 text-center" numberOfLines={1}>
          {staff.name || 'Unnamed'}
        </Text>
        {staff.designation && (
          <Text className="text-sm text-slate-500 mt-0.5 text-center" numberOfLines={1}>
            {staff.designation}
          </Text>
        )}
        <View className="mt-2">
          <RoleBadge role={staff.role} />
        </View>
      </View>

      {/* Week Schedule Preview */}
      {weekSchedule && (
        <View className="flex-row justify-center gap-1 mt-4">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const isWorking = weekSchedule[day] ?? false;
            return (
              <View key={day} className="items-center">
                <Text className="text-xs text-slate-400 mb-1">
                  {DAY_NAMES_SHORT[day].charAt(0)}
                </Text>
                <View
                  className={`w-2 h-2 rounded-full ${
                    isWorking ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
                />
              </View>
            );
          })}
        </View>
      )}

      {!staff.is_active && (
        <View className="bg-slate-100 rounded-lg px-2 py-1 mt-3 self-center">
          <Text className="text-xs text-slate-500">Inactive</Text>
        </View>
      )}
    </Card>
  );
}
