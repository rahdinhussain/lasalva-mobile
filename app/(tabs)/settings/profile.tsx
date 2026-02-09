import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, User, Mail, Briefcase, Calendar } from 'lucide-react-native';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Header } from '@/components/layout';
import { Button, Input, Card, Toggle, Avatar, SkeletonCard, ErrorState } from '@/components/ui';
import { colors } from '@/constants/colors';

export default function ProfileSettingsScreen() {
  const { profile, isLoading, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    designation: profile?.designation || '',
    notify_appointments: profile?.notify_appointments ?? true,
    notify_shifts: profile?.notify_shifts ?? true,
    is_bookable: profile?.is_bookable ?? false,
  });
  const [photoUri, setPhotoUri] = useState<string | null>(profile?.profile_photo_url || null);
  const [photoFile, setPhotoFile] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const isAdmin = profile?.role === 'ADMIN';

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        designation: profile.designation || '',
        notify_appointments: profile.notify_appointments ?? true,
        notify_shifts: profile.notify_shifts ?? true,
        is_bookable: profile.is_bookable ?? false,
      });
      setPhotoUri(profile.profile_photo_url || null);
    }
  }, [profile]);

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
      setPhotoFile({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'photo.jpg',
      });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: Record<string, any> = {
        name: formData.name || undefined,
        email: formData.email || undefined,
        designation: formData.designation || undefined,
        notify_appointments: formData.notify_appointments,
        notify_shifts: formData.notify_shifts,
        photo: photoFile || undefined,
      };
      // Only include is_bookable for admins
      if (isAdmin) {
        updateData.is_bookable = formData.is_bookable;
      }
      await updateProfile.mutateAsync(updateData);
      
      setHasChanges(false);
      setPhotoFile(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Profile" showBack />
        <ErrorState message="Failed to load profile" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading || !profile) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Profile" showBack />
        <View className="p-4">
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Profile" showBack />
      
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
              <Avatar name={formData.name || profile.name || 'N'} size="xl" />
            )}
            <View className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full items-center justify-center border-2 border-white">
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-sm text-slate-500 mt-2">Tap to change photo</Text>
        </View>

        {/* Form */}
        <Card className="p-4 mb-4">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            leftIcon={<User size={20} color={colors.slate[500]} />}
            containerClassName="mb-4"
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.slate[500]} />}
            containerClassName="mb-4"
          />

          <Input
            label="Job Title / Designation"
            placeholder="e.g., Stylist, Manager"
            value={formData.designation}
            onChangeText={(text) => handleChange('designation', text)}
            leftIcon={<Briefcase size={20} color={colors.slate[500]} />}
          />
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-3">Notifications</Text>
          <Toggle
            label="Appointment notifications"
            description="Receive notifications for your appointments"
            value={formData.notify_appointments}
            onChange={(value) => handleChange('notify_appointments', value)}
            className="mb-3"
          />
          <Toggle
            label="Shift notifications"
            description="Receive notifications for schedule changes"
            value={formData.notify_shifts}
            onChange={(value) => handleChange('notify_shifts', value)}
          />
        </Card>

        {/* Public Booking (Admin Only) */}
        {isAdmin && (
          <Card className="p-4 mb-6">
            <Text className="text-sm font-medium text-slate-700 mb-3">Public Booking</Text>
            <Toggle
              label="Available for public booking"
              description="When enabled, customers can book appointments with you"
              value={formData.is_bookable}
              onChange={(value) => handleChange('is_bookable', value)}
            />
          </Card>
        )}

        {!isAdmin && <View className="mb-2" />}

        <Button
          variant="primary"
          fullWidth
          loading={updateProfile.isPending}
          disabled={!hasChanges}
          onPress={handleSave}
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
