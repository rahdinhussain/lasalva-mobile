import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  User,
  Mail,
  Phone,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  UserX,
  RefreshCw,
  Timer,
  CalendarDays,
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentStatus, AvailabilitySlot } from '@/types';
import {
  formatDateInTimeZone,
  formatTimeRangeInTimeZone,
  getDateKeyInTimeZone,
} from '@/utils/dateUtils';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { getDurationInMinutes } from '@/utils/dateUtils';
import { getAppointmentColor, statusColors, colors } from '@/constants/colors';
import { QUERY_KEYS } from '@/constants';
import { rescheduleAppointment, RescheduleAppointmentData } from '@/services/appointments';
import { DateTimeStep } from '@/components/booking/DateTimeStep';
import { Button, Avatar, StatusBadge, Toggle } from '@/components/ui';
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { useServicesList } from '@/hooks/useServices';
import { useStaffList } from '@/hooks/useStaff';

interface AppointmentDetailProps {
  appointment: Appointment | null;
  visible: boolean;
  onClose: () => void;
  timeZone?: string | null;
}

export function AppointmentDetail({
  appointment,
  visible,
  onClose,
  timeZone,
}: AppointmentDetailProps) {
  const insets = useSafeAreaInsets();
  const updateStatus = useUpdateAppointmentStatus();
  const queryClient = useQueryClient();
  const { services } = useServicesList();
  const { staff } = useStaffList();
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<AvailabilitySlot | null>(null);
  const [useAnyStaff, setUseAnyStaff] = useState(false);

  const rescheduleMutation = useMutation({
    mutationFn: (data: RescheduleAppointmentData) => rescheduleAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });

  if (!appointment) return null;

  const color = getAppointmentColor(appointment.id);
  const serviceName =
    appointment.service?.name ||
    services.find((service) => service.id === appointment.service_id)?.name ||
    'Service';
  const staffName =
    appointment.staff?.name ||
    staff.find((member) => member.id === appointment.staff_id)?.name ||
    'Staff';
  const customerName = appointment.customer_name || 'Walk-in';

  // Tax is stored as percentage (e.g. 12 for 12%); calculate dollar amount from price
  const taxPercent = appointment.tax ?? appointment.service?.tax ?? 0;
  const price = appointment.price ?? 0;
  const taxAmount = price * (taxPercent / 100);
  const total = price + taxAmount;

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({
        appointmentId: appointment.id,
        status: newStatus,
      });
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };
  const handleOpenReschedule = () => {
    if (!appointment) return;
    setRescheduleDate(getDateKeyInTimeZone(appointment.start_time, timeZone));
    setRescheduleSlot(null);
    setUseAnyStaff(false);
    setRescheduleVisible(true);
  };

  const handleReschedule = async () => {
    if (!appointment || !rescheduleSlot) return;
    try {
      await rescheduleMutation.mutateAsync({
        appointmentId: appointment.id,
        startTime: rescheduleSlot.startTime,
        endTime: rescheduleSlot.endTime,
        staffId: useAnyStaff ? undefined : appointment.staff_id,
      });
      setRescheduleVisible(false);
      onClose();
    } catch (error: any) {
      Alert.alert('Reschedule Failed', error?.message || 'Unable to reschedule appointment');
    }
  };

  const confirmStatusChange = (status: AppointmentStatus, message: string) => {
    if (!appointment) return;
    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => handleStatusChange(status) },
      ]
    );
  };

  const renderActions = () => {
    switch (appointment.status) {
      case 'PENDING':
        return (
          <View className="gap-3">
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                icon={<XCircle size={18} color={colors.rose[600]} />}
                onPress={() => confirmStatusChange('CANCELLED', 'Cancel this appointment?')}
                disabled={updateStatus.isPending || rescheduleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                icon={<CheckCircle size={18} color="white" />}
                onPress={() => handleStatusChange('CONFIRMED')}
                loading={updateStatus.isPending}
                disabled={rescheduleMutation.isPending}
              >
                Confirm
              </Button>
            </View>
          </View>
        );
      case 'CONFIRMED':
        return (
          <View className="gap-3">
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                icon={<UserX size={18} color={colors.amber[600]} />}
                onPress={() => confirmStatusChange('NO_SHOW', 'Mark as no-show?')}
              >
                No Show
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                icon={<XCircle size={18} color={colors.rose[600]} />}
                onPress={() => confirmStatusChange('CANCELLED', 'Cancel this appointment?')}
                disabled={updateStatus.isPending || rescheduleMutation.isPending}
              >
                Cancel
              </Button>
            </View>
            <Button
              variant="primary"
              fullWidth
              icon={<CheckCircle size={18} color="white" />}
              onPress={() => handleStatusChange('COMPLETED')}
              loading={updateStatus.isPending}
              disabled={rescheduleMutation.isPending}
            >
              Complete
            </Button>
          </View>
        );
      case 'CANCELLED':
      case 'NO_SHOW':
        return (
          <Button
            variant="primary"
            fullWidth
            icon={<RefreshCw size={18} color="white" />}
            onPress={() => handleStatusChange('PENDING')}
            loading={updateStatus.isPending}
          >
            Rebook
          </Button>
        );
      default:
        return null;
    }
  };

  const durationMin = getDurationInMinutes(appointment.start_time, appointment.end_time);
  const hasActions =
    appointment.status === 'PENDING' ||
    appointment.status === 'CONFIRMED' ||
    appointment.status === 'CANCELLED' ||
    appointment.status === 'NO_SHOW';

  return (
    <>
      <Modal
        visible={visible && !rescheduleVisible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-t-3xl max-h-[85%]"
          >
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-slate-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-3 border-b border-slate-100">
            <View className="flex-row items-center gap-3 flex-1">
              <View
                className="w-4 h-12 rounded-full"
                style={{ backgroundColor: color }}
              />
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-semibold text-slate-900">
                    {customerName}
                  </Text>
                  <StatusBadge status={appointment.status} size="sm" />
                </View>
                <Text className="text-sm text-slate-500">
                  {formatDateInTimeZone(appointment.start_time, timeZone, 'EEEE, MMM d, yyyy')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X size={24} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
            {/* Details */}
            <View className="py-4 gap-4 bg-slate-50 rounded-xl p-4 my-3">
              {/* Date */}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                  <CalendarDays size={20} color={colors.slate[600]} />
                </View>
                <View>
                  <Text className="text-sm text-slate-500">Date</Text>
                  <Text className="text-base font-medium text-slate-900">
                    {formatDateInTimeZone(appointment.start_time, timeZone, 'EEEE, MMM d, yyyy')}
                  </Text>
                </View>
              </View>

              {/* Time */}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                  <Clock size={20} color={colors.slate[600]} />
                </View>
                <View>
                  <Text className="text-sm text-slate-500">Time</Text>
                  <Text className="text-base font-medium text-slate-900">
                    {formatTimeRangeInTimeZone(
                      appointment.start_time,
                      appointment.end_time,
                      timeZone
                    )}
                  </Text>
                </View>
              </View>

              {/* Service */}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                  <Briefcase size={20} color={colors.slate[600]} />
                </View>
                <View>
                  <Text className="text-sm text-slate-500">Service</Text>
                  <Text className="text-base font-medium text-slate-900">
                    {serviceName}
                  </Text>
                </View>
              </View>

              {/* Staff */}
              <View className="flex-row items-center gap-3">
                <Avatar
                  source={appointment.staff?.profile_photo_url}
                  name={staffName}
                  size="md"
                />
                <View>
                  <Text className="text-sm text-slate-500">Staff</Text>
                  <Text className="text-base font-medium text-slate-900">
                    {staffName}
                  </Text>
                </View>
              </View>

              {/* Duration */}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                  <Timer size={20} color={colors.slate[600]} />
                </View>
                <View>
                  <Text className="text-sm text-slate-500">Duration</Text>
                  <Text className="text-base font-medium text-slate-900">
                    {formatDuration(durationMin)}
                  </Text>
                </View>
              </View>

              {/* Price */}
              {(appointment.price !== null || appointment.tax !== null) && (
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                    <DollarSign size={20} color={colors.slate[600]} />
                  </View>
                  <View>
                    <Text className="text-sm text-slate-500">Price</Text>
                    <Text className="text-base font-medium text-slate-900">
                      {formatCurrency(price)}
                    </Text>
                    {taxPercent > 0 && (
                      <>
                        <Text className="text-sm text-slate-500">
                          Tax: {formatCurrency(taxAmount)} ({taxPercent}%)
                        </Text>
                        <Text className="text-sm font-semibold text-slate-900">
                          Total: {formatCurrency(total)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* Customer Email */}
              {appointment.customer_email && (
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                    <Mail size={20} color={colors.slate[600]} />
                  </View>
                  <View>
                    <Text className="text-sm text-slate-500">Email</Text>
                    <Text className="text-base font-medium text-slate-900">
                      {appointment.customer_email}
                    </Text>
                  </View>
                </View>
              )}

          {/* Customer Phone */}
          {appointment.customer_phone && (
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                <Phone size={20} color={colors.slate[600]} />
              </View>
              <View>
                <Text className="text-sm text-slate-500">Phone</Text>
                <Text className="text-base font-medium text-slate-900">
                  {appointment.customer_phone}
                </Text>
              </View>
            </View>
          )}
            </View>
          </ScrollView>

          {/* Actions */}
          {hasActions && (
            <View
              className="px-4 pt-4 border-t border-slate-100"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              {renderActions()}
            </View>
          )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={rescheduleVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setRescheduleVisible(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-t-3xl max-h-[90%]"
          >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-slate-300 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between px-4 pb-3 border-b border-slate-100">
            <Text className="text-lg font-semibold text-slate-900">Reschedule</Text>
            <TouchableOpacity onPress={() => setRescheduleVisible(false)} className="p-2 -mr-2">
              <X size={24} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
            <Toggle
              value={useAnyStaff}
              onChange={setUseAnyStaff}
              label="Allow any staff"
              description="Let the system assign any available staff"
              className="mt-2"
            />
          </ScrollView>

          <DateTimeStep
            serviceId={appointment.service_id}
            staffId={useAnyStaff ? undefined : appointment.staff_id}
            selectedDate={rescheduleDate}
            selectedSlot={rescheduleSlot}
            onDateSelect={setRescheduleDate}
            onSlotSelect={setRescheduleSlot}
            onNext={handleReschedule}
            onBack={() => setRescheduleVisible(false)}
            timeZone={timeZone}
            nextLabel="Reschedule"
            isSubmitting={rescheduleMutation.isPending}
          />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
