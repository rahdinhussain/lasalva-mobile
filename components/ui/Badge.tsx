import React from 'react';
import { View, Text } from 'react-native';
import { AppointmentStatus } from '@/types';
import { statusColors } from '@/constants/colors';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-rose-50 text-rose-700',
  info: 'bg-indigo-50 text-indigo-700',
};

const sizeStyles: Record<BadgeSize, { container: string; text: string }> = {
  sm: {
    container: 'px-2 py-0.5',
    text: 'text-xs',
  },
  md: {
    container: 'px-2.5 py-1',
    text: 'text-sm',
  },
};

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const sizeStyle = sizeStyles[size];

  return (
    <View
      className={`rounded-full self-start ${variantStyles[variant]} ${sizeStyle.container} ${className}`}
    >
      <Text className={`font-medium ${sizeStyle.text}`}>{children}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const style = statusColors[status];
  const sizeStyle = sizeStyles[size];

  const labels: Record<AppointmentStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
    COMPLETED: 'Completed',
  };

  return (
    <View
      className={`rounded-full self-start ${style.bg} border ${style.border} ${sizeStyle.container} ${className}`}
    >
      <Text className={`font-medium ${style.text} ${sizeStyle.text}`}>
        {labels[status]}
      </Text>
    </View>
  );
}

interface RoleBadgeProps {
  role: 'ADMIN' | 'STAFF';
  size?: BadgeSize;
  className?: string;
}

export function RoleBadge({ role, size = 'sm', className = '' }: RoleBadgeProps) {
  const isAdmin = role === 'ADMIN';

  return (
    <Badge
      variant={isAdmin ? 'info' : 'default'}
      size={size}
      className={className}
    >
      {isAdmin ? 'Admin' : 'Staff'}
    </Badge>
  );
}
