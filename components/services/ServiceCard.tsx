import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Clock, DollarSign, CreditCard } from 'lucide-react-native';
import { Service, Profile } from '@/types';
import { Card, AvatarGroup } from '@/components/ui';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { colors } from '@/constants/colors';

interface ServiceCardProps {
  service: Service;
  assignedStaff?: Profile[];
}

export function ServiceCard({ service, assignedStaff = [] }: ServiceCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(tabs)/services/${service.id}`);
  };

  return (
    <Card onPress={handlePress} className="overflow-hidden">
      {/* Image */}
      {service.image_url ? (
        <Image
          source={{ uri: service.image_url }}
          style={{ width: '100%', height: 120 }}
          contentFit="cover"
        />
      ) : (
        <View 
          className="h-[120px] items-center justify-center"
          style={{ 
            backgroundColor: colors.indigo[100],
          }}
        >
          <Text className="text-4xl text-indigo-400">
            {service.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="p-3">
        <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
          {service.name}
        </Text>

        <View className="flex-row items-center gap-4 mt-2">
          {/* Duration */}
          <View className="flex-row items-center gap-1">
            <Clock size={14} color={colors.slate[500]} />
            <Text className="text-sm text-slate-500">
              {formatDuration(service.duration_minutes)}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center gap-1">
            <DollarSign size={14} color={colors.slate[500]} />
            <Text className="text-sm text-slate-500">
              {service.price ? formatCurrency(service.price) : '—'}
            </Text>
          </View>
        </View>

        {/* Deposit indicator */}
        {service.deposit_required && (
          <View className="flex-row items-center gap-1 mt-2">
            <CreditCard size={14} color={colors.amber[500]} />
            <Text className="text-xs text-amber-600">
              Deposit required
            </Text>
          </View>
        )}

        {/* Assigned Staff */}
        {assignedStaff.length > 0 && (
          <View className="mt-3 pt-3 border-t border-slate-100">
            <AvatarGroup
              avatars={assignedStaff.map((s) => ({
                source: s.profile_photo_url,
                name: s.name,
              }))}
              max={3}
            />
          </View>
        )}
      </View>

      {/* Inactive overlay */}
      {!service.is_active && (
        <View className="absolute top-2 right-2 bg-slate-900/70 px-2 py-1 rounded-full">
          <Text className="text-xs text-white font-medium">Inactive</Text>
        </View>
      )}
    </Card>
  );
}
