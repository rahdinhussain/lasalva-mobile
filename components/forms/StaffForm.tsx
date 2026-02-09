import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, Mail, Lock, Briefcase } from 'lucide-react-native';
import { Profile } from '@/types';
import { Button, Input, Card, Toggle, Avatar } from '@/components/ui';
import { colors } from '@/constants/colors';

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  designation: string;
  notify_appointments: boolean;
  notify_shifts: boolean;
  photo?: {
    uri: string;
    type: string;
    name: string;
  };
}

interface StaffFormProps {
  initialData?: Partial<Profile>;
  isEditing?: boolean;
  onSubmit: (data: StaffFormData) => Promise<void>;
  isLoading: boolean;
}

export function StaffForm({ initialData, isEditing = false, onSubmit, isLoading }: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    designation: initialData?.designation || '',
    notify_appointments: initialData?.notify_appointments ?? true,
    notify_shifts: initialData?.notify_shifts ?? true,
  });
  const [photoUri, setPhotoUri] = useState<string | null>(initialData?.profile_photo_url || null);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setFormData((prev) => ({
        ...prev,
        photo: {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || 'photo.jpg',
        },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save staff member');
    }
  };

  return (
    <ScrollView 
      className="flex-1" 
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Photo Upload */}
      <View className="items-center mb-6">
        <TouchableOpacity onPress={handlePickImage} className="relative">
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              contentFit="cover"
            />
          ) : (
            <Avatar name={formData.name || 'N'} size="xl" />
          )}
          <View className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full items-center justify-center border-2 border-white">
            <Camera size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text className="text-sm text-slate-500 mt-2">Tap to change photo</Text>
      </View>

      <Card className="p-4 mb-4">
        <Input
          label="Full Name"
          placeholder="Enter full name"
          value={formData.name}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, name: text }));
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          leftIcon={<User size={20} color={colors.slate[500]} />}
          containerClassName="mb-4"
        />

        <Input
          label="Email"
          placeholder="Enter email address"
          value={formData.email}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, email: text }));
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={colors.slate[500]} />}
          containerClassName="mb-4"
        />

        <Input
          label={isEditing ? 'New Password (optional)' : 'Password'}
          placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
          value={formData.password}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, password: text }));
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          secureTextEntry
          leftIcon={<Lock size={20} color={colors.slate[500]} />}
          containerClassName="mb-4"
        />

        <Input
          label="Designation (optional)"
          placeholder="e.g., Stylist, Therapist"
          value={formData.designation}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, designation: text }))}
          leftIcon={<Briefcase size={20} color={colors.slate[500]} />}
        />
      </Card>

      <Card className="p-4 mb-6">
        <Text className="text-sm font-medium text-slate-700 mb-3">Notifications</Text>
        <Toggle
          label="Appointment notifications"
          description="Receive notifications for new appointments"
          value={formData.notify_appointments}
          onChange={(value) => setFormData((prev) => ({ ...prev, notify_appointments: value }))}
          className="mb-3"
        />
        <Toggle
          label="Shift notifications"
          description="Receive notifications for schedule changes"
          value={formData.notify_shifts}
          onChange={(value) => setFormData((prev) => ({ ...prev, notify_shifts: value }))}
        />
      </Card>

      <Button
        variant="primary"
        fullWidth
        loading={isLoading}
        onPress={handleSubmit}
      >
        {isEditing ? 'Save Changes' : 'Add Staff Member'}
      </Button>
    </ScrollView>
  );
}
