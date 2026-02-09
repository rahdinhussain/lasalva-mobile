import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { getInitials } from '@/utils/formatters';
import { colors } from '@/constants/colors';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string | null;
  size?: AvatarSize;
  gradient?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    pixels: 32,
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    pixels: 40,
  },
  lg: {
    container: 'w-14 h-14',
    text: 'text-lg',
    pixels: 56,
  },
  xl: {
    container: 'w-20 h-20',
    text: 'text-2xl',
    pixels: 80,
  },
};

// Get a consistent color based on name
function getAvatarColor(name: string | null | undefined): string {
  if (!name) return colors.slate[500];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % colors.appointmentPalette.length;
  return colors.appointmentPalette[index];
}

export function Avatar({ source, name, size = 'md', gradient = false, className = '' }: AvatarProps) {
  const sizeStyle = sizeStyles[size];
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  if (source) {
    return (
      <View className={`${sizeStyle.container} rounded-full overflow-hidden ${className}`}>
        <Image
          source={{ uri: source }}
          style={{ width: sizeStyle.pixels, height: sizeStyle.pixels }}
          contentFit="cover"
          transition={200}
          placeholder={require('../../assets/icon.png')}
        />
      </View>
    );
  }

  return (
    <View
      className={`${sizeStyle.container} rounded-full items-center justify-center ${className}`}
      style={{ backgroundColor: gradient ? undefined : bgColor }}
    >
      {gradient && (
        <View 
          className="absolute inset-0 rounded-full"
          style={{ 
            backgroundColor: colors.indigo[500],
          }}
        />
      )}
      <Text className={`font-semibold text-white ${sizeStyle.text}`}>
        {initials}
      </Text>
    </View>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ source?: string | null; name?: string | null }>;
  size?: AvatarSize;
  max?: number;
  className?: string;
}

export function AvatarGroup({ avatars, size = 'sm', max = 3, className = '' }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const sizeStyle = sizeStyles[size];

  return (
    <View className={`flex-row ${className}`}>
      {displayed.map((avatar, index) => (
        <View
          key={index}
          style={{ marginLeft: index > 0 ? -8 : 0 }}
          className="border-2 border-white rounded-full"
        >
          <Avatar source={avatar.source} name={avatar.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={{ marginLeft: -8 }}
          className={`${sizeStyle.container} rounded-full items-center justify-center bg-slate-200 border-2 border-white`}
        >
          <Text className={`font-medium text-slate-600 ${sizeStyles.sm.text}`}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
