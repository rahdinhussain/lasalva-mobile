import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Alert,
  Modal,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useBusiness } from '@/context/BusinessContext';
import { useCreateBooking } from '@/hooks/useBooking';
import { Service, AvailabilitySlot } from '@/types';
import { getDateKeyInTimeZone, getNowInTimeZone } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { StepIndicator } from './StepIndicator';
import { ServiceStep } from './ServiceStep';
import { StaffStep } from './StaffStep';
import { DateStep } from './DateStep';
import { TimeStep } from './TimeStep';
import { CustomerDetailsStep } from './CustomerDetailsStep';
import { ConfirmationStep } from './ConfirmationStep';

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface BookingData {
  service: Service | null;
  staffId: string | null;
  staffSelected: boolean;
  staffName: string | null;
  date: string | null;
  slot: AvailabilitySlot | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const INITIAL_BOOKING_DATA: BookingData = {
  service: null,
  staffId: null,
  staffSelected: false,
  staffName: null,
  date: null,
  slot: null,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export function BookingModal({ visible, onClose, initialDate }: BookingModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { business } = useBusiness();
  const timeZone = business?.timezone ?? null;
  const createBooking = useCreateBooking();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA);

  const allowChooseStaff = business?.allow_customer_choose_staff ?? false;

  const effectiveStep = useMemo(() => {
    if (!allowChooseStaff && currentStep >= 2) return currentStep - 1;
    return currentStep;
  }, [currentStep, allowChooseStaff]);

  const totalSteps = allowChooseStaff ? 6 : 5;

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setBookingData(INITIAL_BOOKING_DATA);
    createBooking.reset();
  }, [createBooking]);

  const handleDismiss = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === 1 && !allowChooseStaff) return 3 as BookingStep;
      return Math.min(prev + 1, 6) as BookingStep;
    });
  }, [allowChooseStaff]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === 3 && !allowChooseStaff) return 1 as BookingStep;
      return Math.max(prev - 1, 1) as BookingStep;
    });
  }, [allowChooseStaff]);

  const handleServiceSelect = useCallback((service: Service) => {
    setBookingData((prev) => ({
      ...prev,
      service,
      staffId: null,
      staffSelected: false,
      staffName: null,
      date: null,
      slot: null,
    }));
  }, []);

  const handleStaffSelect = useCallback((staffId: string | null, staffName: string | null) => {
    setBookingData((prev) => ({
      ...prev,
      staffId,
      staffSelected: true,
      staffName,
      date: null,
      slot: null,
    }));
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    setBookingData((prev) => ({ ...prev, date, slot: null }));
  }, []);

  const handleSlotSelect = useCallback((slot: AvailabilitySlot) => {
    setBookingData((prev) => ({ ...prev, slot }));
  }, []);

  const handleFieldChange = useCallback(
    (field: 'customerName' | 'customerEmail' | 'customerPhone', value: string) => {
      setBookingData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleConfirmBooking = useCallback(async () => {
    if (!bookingData.service || !bookingData.slot || !bookingData.date) return;
    const staffId = bookingData.staffId ?? bookingData.slot.totalStaffIds?.[0] ?? null;
    if (!staffId) {
      Alert.alert('No Staff Available', 'Please select a different time slot.');
      return;
    }
    try {
      await createBooking.mutateAsync({
        serviceId: bookingData.service.id,
        staffId,
        startTime: bookingData.slot.startTime,
        endTime: bookingData.slot.endTime,
        customerName: bookingData.customerName.trim(),
        customerEmail: bookingData.customerEmail.trim(),
        customerPhone: bookingData.customerPhone.trim() || undefined,
      });
      setCurrentStep(6);
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error?.message || 'Unable to complete the booking. Please try again.'
      );
    }
  }, [bookingData, createBooking]);

  const handleBookAnother = useCallback(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (visible && initialDate) {
      const today = getNowInTimeZone(timeZone);
      today.setHours(0, 0, 0, 0);
      if (initialDate >= today) {
        setBookingData((prev) => ({
          ...prev,
          date: getDateKeyInTimeZone(initialDate, timeZone),
        }));
      }
    }
  }, [visible, initialDate, timeZone]);

  const modalHeight = Math.min(windowHeight * 0.88, 680);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleDismiss}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={handleDismiss}
      >
        <Pressable
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: modalHeight,
            paddingBottom: insets.bottom + 24,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between px-4 pt-3 pb-2 border-b border-slate-100">
            <View style={{ width: 32 }} />
            <View className="w-10 h-1 rounded-full bg-slate-200" />
            <TouchableOpacity onPress={handleDismiss} className="p-2" hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={24} color={colors.slate[600]} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <StepIndicator
              currentStep={allowChooseStaff ? currentStep : effectiveStep}
              totalSteps={totalSteps}
              skipStaff={!allowChooseStaff}
            />

            {currentStep === 1 && (
              <ServiceStep
                selectedService={bookingData.service}
                onSelect={handleServiceSelect}
                onNext={goNext}
              />
            )}

            {currentStep === 2 && bookingData.service && business && (
              <StaffStep
                businessId={business.id}
                serviceId={bookingData.service.id}
                selectedStaffId={bookingData.staffSelected ? bookingData.staffId ?? undefined : undefined}
                onSelect={handleStaffSelect}
                onNext={goNext}
                onBack={goBack}
              />
            )}

            {currentStep === 3 && bookingData.service && (
              <DateStep
                selectedDate={bookingData.date}
                onDateSelect={handleDateSelect}
                onNext={goNext}
                onBack={goBack}
                timeZone={timeZone}
              />
            )}

            {currentStep === 4 && bookingData.service && bookingData.date && (
              <TimeStep
                serviceId={bookingData.service.id}
                staffId={bookingData.staffId ?? undefined}
                date={bookingData.date}
                selectedSlot={bookingData.slot}
                onSlotSelect={handleSlotSelect}
                onNext={goNext}
                onBack={goBack}
                timeZone={timeZone}
              />
            )}

            {currentStep === 5 && bookingData.service && bookingData.date && bookingData.slot && (
              <CustomerDetailsStep
                service={bookingData.service}
                staffName={bookingData.staffName}
                date={bookingData.date}
                slot={bookingData.slot}
                customerName={bookingData.customerName}
                customerEmail={bookingData.customerEmail}
                customerPhone={bookingData.customerPhone}
                onFieldChange={handleFieldChange}
                onConfirm={handleConfirmBooking}
                onBack={goBack}
                isSubmitting={createBooking.isPending}
                timeZone={timeZone}
              />
            )}

            {currentStep === 6 && bookingData.service && bookingData.date && bookingData.slot && (
              <ConfirmationStep
                service={bookingData.service}
                staffName={bookingData.staffName}
                date={bookingData.date}
                slot={bookingData.slot}
                customerName={bookingData.customerName}
                onBookAnother={handleBookAnother}
                onClose={handleDismiss}
                timeZone={timeZone}
                status={business?.auto_confirm_appointments ? 'CONFIRMED' : 'PENDING'}
              />
            )}
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
