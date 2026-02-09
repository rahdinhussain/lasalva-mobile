import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { User, Mail, Phone, Clock, DollarSign, Calendar } from 'lucide-react-native';
import { Service, AvailabilitySlot } from '@/types';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { formatDate, formatInTimeZoneSafe } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CustomerDetailsStepProps {
  service: Service;
  staffName: string | null;
  date: string;
  slot: AvailabilitySlot;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onFieldChange: (field: 'customerName' | 'customerEmail' | 'customerPhone', value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  timeZone?: string | null;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function CustomerDetailsStep({
  service,
  staffName,
  date,
  slot,
  customerName,
  customerEmail,
  customerPhone,
  onFieldChange,
  onConfirm,
  onBack,
  isSubmitting,
  timeZone,
}: CustomerDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const price = service.price ?? 0;
  const taxPercent = service.tax ?? 0;
  const taxAmount = price * (taxPercent / 100);
  const total = price + taxAmount;

  const handleConfirm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!validateEmail(customerEmail.trim())) {
      newErrors.customerEmail = 'Invalid email address';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onConfirm();
    }
  };

  return (
    <BottomSheetScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-lg font-semibold text-slate-900 mb-3">
        Booking Details
      </Text>

      {/* Summary */}
      <View className="bg-slate-50 rounded-xl p-4 mb-4 gap-3">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <DollarSign size={16} color={colors.indigo[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-900">{service.name}</Text>
            <Text className="text-xs text-slate-500">
              {formatDuration(service.duration_minutes)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <User size={16} color={colors.indigo[600]} />
          </View>
          <Text className="text-sm text-slate-700">
            {staffName ?? 'Any Available Staff'}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <Calendar size={16} color={colors.indigo[600]} />
          </View>
          <Text className="text-sm text-slate-700">
            {formatDate(date, 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
            <Clock size={16} color={colors.indigo[600]} />
          </View>
          <Text className="text-sm text-slate-700">
            {formatInTimeZoneSafe(slot.startTime, timeZone, 'h:mm a')} -{' '}
            {formatInTimeZoneSafe(slot.endTime, timeZone, 'h:mm a')}
          </Text>
        </View>

        {/* Price breakdown */}
        <View className="border-t border-slate-200 pt-3 mt-1">
          <View className="flex-row justify-between">
            <Text className="text-sm text-slate-500">Subtotal</Text>
            <Text className="text-sm text-slate-700">{formatCurrency(price)}</Text>
          </View>
          {taxPercent > 0 && (
            <View className="flex-row justify-between mt-1">
              <Text className="text-sm text-slate-500">Tax ({taxPercent}%)</Text>
              <Text className="text-sm text-slate-700">{formatCurrency(taxAmount)}</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm font-semibold text-slate-900">Total</Text>
            <Text className="text-sm font-semibold text-slate-900">{formatCurrency(total)}</Text>
          </View>
        </View>
      </View>

      {/* Customer Form */}
      <Text className="text-base font-semibold text-slate-900 mb-3">
        Customer Information
      </Text>

      <View className="gap-3 mb-4">
        <Input
          label="Full Name"
          placeholder="Enter customer name"
          value={customerName}
          onChangeText={(v) => {
            onFieldChange('customerName', v);
            if (errors.customerName) setErrors((e) => ({ ...e, customerName: '' }));
          }}
          error={errors.customerName}
          leftIcon={<User size={18} color={colors.slate[400]} />}
          autoCapitalize="words"
          component={BottomSheetTextInput}
        />

        <Input
          label="Email"
          placeholder="Enter customer email"
          value={customerEmail}
          onChangeText={(v) => {
            onFieldChange('customerEmail', v);
            if (errors.customerEmail) setErrors((e) => ({ ...e, customerEmail: '' }));
          }}
          error={errors.customerEmail}
          leftIcon={<Mail size={18} color={colors.slate[400]} />}
          keyboardType="email-address"
          autoCapitalize="none"
          component={BottomSheetTextInput}
        />

        <Input
          label="Phone (optional)"
          placeholder="Enter phone number"
          value={customerPhone}
          onChangeText={(v) => onFieldChange('customerPhone', v)}
          leftIcon={<Phone size={18} color={colors.slate[400]} />}
          keyboardType="phone-pad"
          component={BottomSheetTextInput}
        />
      </View>

      <View className="flex-row gap-3 pt-4 pb-2">
        <Button variant="secondary" onPress={onBack} className="flex-1" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          variant="primary"
          onPress={handleConfirm}
          className="flex-1"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Confirm Booking
        </Button>
      </View>
    </BottomSheetScrollView>
  );
}
