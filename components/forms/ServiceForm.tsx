import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Type, Clock, DollarSign, Percent, CreditCard, FileText } from 'lucide-react-native';
import { Service } from '@/types';
import { Button, Input, Card, Toggle, Select } from '@/components/ui';
import { colors } from '@/constants/colors';

export interface ServiceFormData {
  name: string;
  duration_minutes: number;
  price: string;
  tax: string;
  deposit_required: boolean;
  deposit_amount: string;
  deposit_note: string;
  image?: {
    uri: string;
    type: string;
    name: string;
  };
}

interface ServiceFormProps {
  initialData?: Partial<Service>;
  isEditing?: boolean;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  isLoading: boolean;
}

const durationOptions = [
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1 hr 15 min', value: '75' },
  { label: '1 hr 30 min', value: '90' },
  { label: '2 hours', value: '120' },
  { label: '2 hr 30 min', value: '150' },
  { label: '3 hours', value: '180' },
];

export function ServiceForm({ initialData, isEditing = false, onSubmit, isLoading }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || '',
    duration_minutes: initialData?.duration_minutes || 60,
    price: initialData?.price?.toString() || '',
    tax: initialData?.tax?.toString() || '',
    deposit_required: initialData?.deposit_required ?? false,
    deposit_amount: initialData?.deposit_amount?.toString() || '',
    deposit_note: initialData?.deposit_note || '',
  });
  const [imageUri, setImageUri] = useState<string | null>(initialData?.image_url || null);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Invalid price';
    }

    if (formData.tax && isNaN(parseFloat(formData.tax))) {
      newErrors.tax = 'Invalid tax percentage';
    }

    if (formData.deposit_required && !formData.deposit_amount) {
      newErrors.deposit_amount = 'Deposit amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setFormData((prev) => ({
        ...prev,
        image: {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
        },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save service');
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Image Upload */}
      <TouchableOpacity onPress={handlePickImage} className="mb-6">
        {imageUri ? (
          <View className="rounded-2xl overflow-hidden">
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: 180 }}
              contentFit="cover"
            />
            <View className="absolute inset-0 bg-black/30 items-center justify-center">
              <View className="bg-white/90 px-4 py-2 rounded-full flex-row items-center gap-2">
                <Camera size={18} color={colors.slate[700]} />
                <Text className="text-sm font-medium text-slate-700">Change Image</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="h-[180px] bg-slate-100 rounded-2xl items-center justify-center border-2 border-dashed border-slate-300">
            <Camera size={32} color={colors.slate[400]} />
            <Text className="text-sm text-slate-500 mt-2">Add service image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Basic Info */}
      <Card className="p-4 mb-4">
        <Input
          label="Service Name"
          placeholder="e.g., Haircut, Massage"
          value={formData.name}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, name: text }));
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          leftIcon={<Type size={20} color={colors.slate[500]} />}
          containerClassName="mb-4"
        />

        <Select
          label="Duration"
          value={formData.duration_minutes.toString()}
          options={durationOptions}
          onChange={(value) => setFormData((prev) => ({ ...prev, duration_minutes: parseInt(value) }))}
          className="mb-4"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Price (optional)"
              placeholder="0.00"
              value={formData.price}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, price: text }));
                setErrors((prev) => ({ ...prev, price: undefined }));
              }}
              error={errors.price}
              keyboardType="decimal-pad"
              leftIcon={<DollarSign size={20} color={colors.slate[500]} />}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Tax % (optional)"
              placeholder="0"
              value={formData.tax}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, tax: text }));
                setErrors((prev) => ({ ...prev, tax: undefined }));
              }}
              error={errors.tax}
              keyboardType="decimal-pad"
              leftIcon={<Percent size={20} color={colors.slate[500]} />}
            />
          </View>
        </View>
      </Card>

      {/* Deposit */}
      <Card className="p-4 mb-6">
        <Toggle
          label="Require deposit"
          description="Customers must pay a deposit when booking"
          value={formData.deposit_required}
          onChange={(value) => setFormData((prev) => ({ ...prev, deposit_required: value }))}
          className="mb-4"
        />

        {formData.deposit_required && (
          <>
            <Input
              label="Deposit Amount"
              placeholder="0.00"
              value={formData.deposit_amount}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, deposit_amount: text }));
                setErrors((prev) => ({ ...prev, deposit_amount: undefined }));
              }}
              error={errors.deposit_amount}
              keyboardType="decimal-pad"
              leftIcon={<CreditCard size={20} color={colors.slate[500]} />}
              containerClassName="mb-4"
            />
            <Input
              label="Deposit Note (optional)"
              placeholder="e.g., Non-refundable within 24 hours"
              value={formData.deposit_note}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, deposit_note: text }))}
              leftIcon={<FileText size={20} color={colors.slate[500]} />}
              multiline
            />
          </>
        )}
      </Card>

      <Button
        variant="primary"
        fullWidth
        loading={isLoading}
        onPress={handleSubmit}
      >
        {isEditing ? 'Save Changes' : 'Create Service'}
      </Button>
    </ScrollView>
  );
}
