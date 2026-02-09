import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { 
  Camera, 
  Building2, 
  Link2, 
  Mail, 
  Phone, 
  MapPin,
  Copy,
  Check,
} from 'lucide-react-native';
import { useBusiness } from '@/context/BusinessContext';
import { useUpdateBusiness, useUpdateBusinessHours } from '@/hooks/useBusiness';
import { BusinessHour } from '@/types';
import { Header } from '@/components/layout';
import { Button, Input, Card, Toggle, Select, SkeletonCard, ErrorState } from '@/components/ui';
import { colors } from '@/constants/colors';
import { BOOKING_BASE_URL } from '@/constants';
import { DAY_NAMES } from '@/constants';
import { generateTimeSlots } from '@/utils/dateUtils';

const countryOptions = [
  { label: 'United States', value: 'US' },
  { label: 'Canada', value: 'CA' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Australia', value: 'AU' },
  { label: 'Philippines', value: 'PH' },
];

const timeOptions = generateTimeSlots(0, 24, 30).map((time) => ({
  label: formatTimeLabel(time),
  value: time,
}));

function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function BusinessSettingsScreen() {
  const { business, businessHours, isLoading, error, refetch } = useBusiness();
  const updateBusiness = useUpdateBusiness();
  const updateHours = useUpdateBusinessHours();

  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    phone_country_code: '',
    address_street: '',
    address_city: '',
    address_province: '',
    address_country: '',
    address_postal_code: '',
    allow_customer_choose_staff: false,
    auto_confirm_appointments: false,
    admin_email_notifications: false,
  });
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<{ uri: string; type: string; name: string } | null>(null);
  // Initialize hours with defaults for all days
  const [hours, setHours] = useState<Record<number, { open: string; close: string; closed: boolean }>>(() => {
    const defaultHours: Record<number, { open: string; close: string; closed: boolean }> = {};
    for (let i = 0; i < 7; i++) {
      defaultHours[i] = { open: '09:00', close: '17:00', closed: i === 0 }; // Sunday closed by default
    }
    return defaultHours;
  });
  const [hoursInitialized, setHoursInitialized] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        slug: business.slug || '',
        email: business.email || '',
        phone: business.phone || '',
        phone_country_code: business.phone_country_code || '',
        address_street: business.address_street || '',
        address_city: business.address_city || '',
        address_province: business.address_province || '',
        address_country: business.address_country || '',
        address_postal_code: business.address_postal_code || '',
        allow_customer_choose_staff: business.allow_customer_choose_staff,
        auto_confirm_appointments: business.auto_confirm_appointments,
        admin_email_notifications: business.admin_email_notifications,
      });
      setLogoUri(business.logo_url || null);
    }
  }, [business]);

  // Helper to normalize time format (09:00:00 -> 09:00)
  const normalizeTime = (time: string): string => {
    if (!time) return '09:00';
    // Remove seconds if present (09:00:00 -> 09:00)
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  useEffect(() => {
    // Update from API data when available
    if (businessHours.length > 0 || !hoursInitialized) {
      const hoursMap: Record<number, { open: string; close: string; closed: boolean }> = {};
      for (let i = 0; i < 7; i++) {
        const dayHours = businessHours.find((h) => h.day_of_week === i);
        if (dayHours) {
          // Day has hours in API = it's open
          hoursMap[i] = {
            open: normalizeTime(dayHours.open_time),
            close: normalizeTime(dayHours.close_time),
            closed: false,
          };
        } else if (businessHours.length > 0) {
          // API data loaded but this day is not in it = closed
          hoursMap[i] = { open: '09:00', close: '17:00', closed: true };
        } else {
          // No API data yet, use defaults
          hoursMap[i] = { open: '09:00', close: '17:00', closed: i === 0 || i === 6 };
        }
      }
      setHours(hoursMap);
      setHoursInitialized(true);
    }
  }, [businessHours, hoursInitialized]);

  const base = BOOKING_BASE_URL.replace(/\/$/, '');
  const bookingUrl = business?.slug ? `${base}/${business.slug}` : null;

  const handleCopyLink = async () => {
    if (bookingUrl) {
      await Clipboard.setStringAsync(bookingUrl);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setLogoUri(asset.uri);
      setLogoFile({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'logo.jpg',
      });
      setHasChanges(true);
    }
  };

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleHoursChange = (day: number, field: 'open' | 'close' | 'closed', value: any) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Update business info
      await updateBusiness.mutateAsync({
        name: formData.name || undefined,
        slug: formData.slug || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        phone_country_code: formData.phone_country_code || undefined,
        address_street: formData.address_street || undefined,
        address_city: formData.address_city || undefined,
        address_province: formData.address_province || undefined,
        address_country: formData.address_country || undefined,
        address_postal_code: formData.address_postal_code || undefined,
        allow_customer_choose_staff: formData.allow_customer_choose_staff,
        auto_confirm_appointments: formData.auto_confirm_appointments,
        admin_email_notifications: formData.admin_email_notifications,
        logo: logoFile || undefined,
      });

      // Update business hours
      const hoursData: BusinessHour[] = Object.entries(hours)
        .filter(([_, h]) => !h.closed)
        .map(([day, h]) => ({
          day_of_week: parseInt(day),
          open_time: h.open,
          close_time: h.close,
        }));
      
      await updateHours.mutateAsync(hoursData);
      
      setHasChanges(false);
      setLogoFile(null);
      Alert.alert('Success', 'Business settings updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update settings');
    }
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Business" showBack />
        <ErrorState message="Failed to load business settings" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading || !business) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Business" showBack />
        <View className="p-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Business" showBack />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Booking Link */}
        {bookingUrl && (
          <Card className="p-4 mb-4 bg-indigo-50 border-indigo-200">
            <View className="flex-row items-center mb-2">
              <Link2 size={18} color={colors.indigo[600]} />
              <Text className="text-sm font-medium text-indigo-700 ml-2">
                Booking Link
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="flex-1 text-sm text-indigo-600" numberOfLines={1}>
                {bookingUrl}
              </Text>
              <TouchableOpacity onPress={handleCopyLink} className="ml-2 p-2">
                {copied ? (
                  <Check size={20} color={colors.emerald[600]} />
                ) : (
                  <Copy size={20} color={colors.indigo[600]} />
                )}
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Logo & Name */}
        <Card className="p-4 mb-4">
          <Text className="text-base font-semibold text-slate-900 mb-4">Studio Details</Text>
          
          <View className="items-center mb-4">
            <TouchableOpacity onPress={handlePickLogo} className="relative">
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={{ width: 80, height: 80, borderRadius: 16 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-2xl bg-slate-100 items-center justify-center">
                  <Building2 size={32} color={colors.slate[400]} />
                </View>
              )}
              <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full items-center justify-center border-2 border-white">
                <Camera size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <Input
            label="Business Name"
            placeholder="Your business name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            leftIcon={<Building2 size={20} color={colors.slate[500]} />}
            containerClassName="mb-4"
          />

          <Input
            label="Booking URL Slug"
            placeholder="your-business"
            value={formData.slug}
            onChangeText={(text) => handleChange('slug', text)}
            autoCapitalize="none"
            leftIcon={<Link2 size={20} color={colors.slate[500]} />}
          />
        </Card>

        {/* Contact */}
        <Card className="p-4 mb-4">
          <Text className="text-base font-semibold text-slate-900 mb-4">Contact Information</Text>
          
          <Input
            label="Business Email"
            placeholder="email@business.com"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.slate[500]} />}
            containerClassName="mb-4"
          />

          <View className="flex-row gap-3 mb-4">
            <View style={{ width: 80 }}>
              <Input
                label="Code"
                placeholder="+1"
                value={formData.phone_country_code}
                onChangeText={(text) => handleChange('phone_country_code', text)}
                keyboardType="phone-pad"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Phone"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color={colors.slate[500]} />}
              />
            </View>
          </View>

          <Input
            label="Street Address"
            placeholder="123 Main St"
            value={formData.address_street}
            onChangeText={(text) => handleChange('address_street', text)}
            leftIcon={<MapPin size={20} color={colors.slate[500]} />}
            containerClassName="mb-4"
          />

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Input
                label="City"
                placeholder="City"
                value={formData.address_city}
                onChangeText={(text) => handleChange('address_city', text)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Province/State"
                placeholder="Province"
                value={formData.address_province}
                onChangeText={(text) => handleChange('address_province', text)}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Select
                label="Country"
                placeholder="Select"
                value={formData.address_country}
                options={countryOptions}
                onChange={(value) => handleChange('address_country', value)}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Postal Code"
                placeholder="12345"
                value={formData.address_postal_code}
                onChangeText={(text) => handleChange('address_postal_code', text)}
              />
            </View>
          </View>
        </Card>

        {/* Operating Hours */}
        <Card className="p-4 mb-4">
          <Text className="text-base font-semibold text-slate-900 mb-4">Operating Hours</Text>
          
          {[1, 2, 3, 4, 5, 6, 0].map((day) => (
            <View key={day} className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-slate-700 w-24">
                  {DAY_NAMES[day]}
                </Text>
                <Toggle
                  value={!hours[day]?.closed}
                  onChange={(value) => handleHoursChange(day, 'closed', !value)}
                />
              </View>
              {!hours[day]?.closed && (
                <View className="flex-row gap-3 pl-24">
                  <View className="flex-1">
                    <Select
                      placeholder="Open"
                      value={hours[day]?.open || '09:00'}
                      options={timeOptions}
                      onChange={(value) => handleHoursChange(day, 'open', value)}
                    />
                  </View>
                  <View className="flex-1">
                    <Select
                      placeholder="Close"
                      value={hours[day]?.close || '17:00'}
                      options={timeOptions}
                      onChange={(value) => handleHoursChange(day, 'close', value)}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </Card>

        {/* Preferences */}
        <Card className="p-4 mb-6">
          <Text className="text-base font-semibold text-slate-900 mb-4">Booking Preferences</Text>
          
          <Toggle
            label="Allow customers to choose staff"
            description="Customers can select their preferred staff member"
            value={formData.allow_customer_choose_staff}
            onChange={(value) => handleChange('allow_customer_choose_staff', value)}
            className="mb-4"
          />
          
          <Toggle
            label="Auto-confirm appointments"
            description="New bookings are automatically confirmed"
            value={formData.auto_confirm_appointments}
            onChange={(value) => handleChange('auto_confirm_appointments', value)}
            className="mb-4"
          />
          
          <Toggle
            label="Admin email notifications"
            description="Receive email for new bookings"
            value={formData.admin_email_notifications}
            onChange={(value) => handleChange('admin_email_notifications', value)}
          />
        </Card>

        <Button
          variant="primary"
          fullWidth
          loading={updateBusiness.isPending || updateHours.isPending}
          disabled={!hasChanges}
          onPress={handleSave}
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
