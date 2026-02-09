import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Users, Check } from 'lucide-react-native';
import { useBookingStaff } from '@/hooks/useBooking';
import { PublicStaff } from '@/services/public';
import { colors } from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

interface StaffStepProps {
  businessId: string;
  serviceId: string;
  selectedStaffId: string | null | undefined; // undefined = not chosen yet, null = no preference
  onSelect: (staffId: string | null, staffName: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

function StaffCard({
  staff,
  isSelected,
  onPress,
}: {
  staff: PublicStaff;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-white rounded-xl border p-3 flex-row items-center gap-3 ${
        isSelected ? 'border-2 border-indigo-600' : 'border-slate-200'
      }`}
    >
      <Avatar
        source={staff.profile_photo_url}
        name={staff.name}
        size="md"
      />
      <View className="flex-1">
        <Text className="text-base font-medium text-slate-900">{staff.name}</Text>
        {staff.designation && (
          <Text className="text-xs text-slate-500 mt-0.5">{staff.designation}</Text>
        )}
      </View>
      {isSelected && (
        <View className="w-6 h-6 rounded-full bg-indigo-600 items-center justify-center">
          <Check size={14} color="#ffffff" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export function StaffStep({
  businessId,
  serviceId,
  selectedStaffId,
  onSelect,
  onNext,
  onBack,
}: StaffStepProps) {
  const { staff, isLoading, error } = useBookingStaff(businessId, serviceId);
  // null means "no preference" was chosen; undefined means nothing chosen yet
  const hasSelection = selectedStaffId !== undefined;

  if (error) {
    return <ErrorState message="Failed to load staff" />;
  }

  return (
    <View className="flex-1 px-4">
      <Text className="text-lg font-semibold text-slate-900 mb-3">
        Choose a Staff Member
      </Text>

      {isLoading ? (
        <View className="gap-2">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </View>
      ) : (
        <View className="gap-2.5">
          {/* No Preference option */}
          <TouchableOpacity
            onPress={() => onSelect(null, null)}
            activeOpacity={0.7}
            className={`bg-white rounded-xl border p-3 flex-row items-center gap-3 ${
              selectedStaffId === null ? 'border-2 border-indigo-600' : 'border-slate-200'
            }`}
          >
            <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
              <Users size={20} color={colors.slate[500]} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-slate-900">No Preference</Text>
              <Text className="text-xs text-slate-500 mt-0.5">Any available staff</Text>
            </View>
            {selectedStaffId === null && (
              <View className="w-6 h-6 rounded-full bg-indigo-600 items-center justify-center">
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          {/* Staff list */}
          {staff.map((item) => (
            <StaffCard
              key={item.id}
              staff={item}
              isSelected={selectedStaffId === item.id}
              onPress={() => onSelect(item.id, item.name)}
            />
          ))}
        </View>
      )}

      <View className="flex-row gap-3 pt-4 pb-2">
        <Button variant="secondary" onPress={onBack} className="flex-1">
          Back
        </Button>
        <Button
          variant="primary"
          disabled={!hasSelection}
          onPress={onNext}
          className="flex-1"
        >
          Next
        </Button>
      </View>
    </View>
  );
}
