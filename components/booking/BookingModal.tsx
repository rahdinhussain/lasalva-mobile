import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useBusiness } from '@/context/BusinessContext';
import { useCreateBooking } from '@/hooks/useBooking';
import { Service, AvailabilitySlot } from '@/types';
import { getDateKeyInTimeZone, getNowInTimeZone } from '@/utils/dateUtils';
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
  staffId: string | null; // null = "no preference" chosen
  staffSelected: boolean; // whether staff step has been completed
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { business } = useBusiness();
  const timeZone = business?.timezone ?? null;
  const createBooking = useCreateBooking();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA);

  const allowChooseStaff = business?.allow_customer_choose_staff ?? false;

  // Effective step count (skip staff step if not allowed)
  const effectiveStep = useMemo(() => {
    if (!allowChooseStaff && currentStep >= 2) {
      return currentStep - 1;
    }
    return currentStep;
  }, [currentStep, allowChooseStaff]);

  const totalSteps = allowChooseStaff ? 6 : 5;

  const snapPoints = useMemo(() => {
    switch (currentStep) {
      case 1: return ['90%'];  // Service
      case 2: return ['75%'];  // Staff
      case 3: return ['85%'];  // Date
      case 4: return ['80%'];  // Time
      case 5: return ['90%'];  // Customer Details
      case 6: return ['55%'];  // Confirmation
      default: return ['85%'];
    }
  }, [currentStep]);

  // Present/dismiss based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

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
      if (prev === 1 && !allowChooseStaff) {
        return 3; // Skip staff selection
      }
      return Math.min(prev + 1, 6) as BookingStep;
    });
  }, [allowChooseStaff]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === 3 && !allowChooseStaff) {
        return 1; // Skip back over staff selection
      }
      return Math.max(prev - 1, 1) as BookingStep;
    });
  }, [allowChooseStaff]);

  // Service selection
  const handleServiceSelect = useCallback((service: Service) => {
    setBookingData((prev) => ({
      ...prev,
      service,
      // Reset downstream selections when service changes
      staffId: null,
      staffSelected: false,
      staffName: null,
      date: null,
      slot: null,
    }));
  }, []);

  // Staff selection
  const handleStaffSelect = useCallback((staffId: string | null, staffName: string | null) => {
    setBookingData((prev) => ({
      ...prev,
      staffId,
      staffSelected: true,
      staffName,
      // Reset downstream when staff changes
      date: null,
      slot: null,
    }));
  }, []);

  // Date selection
  const handleDateSelect = useCallback((date: string) => {
    setBookingData((prev) => ({
      ...prev,
      date,
      slot: null, // Reset slot when date changes
    }));
  }, []);

  // Slot selection
  const handleSlotSelect = useCallback((slot: AvailabilitySlot) => {
    setBookingData((prev) => ({ ...prev, slot }));
  }, []);

  // Field changes for customer details
  const handleFieldChange = useCallback(
    (field: 'customerName' | 'customerEmail' | 'customerPhone', value: string) => {
      setBookingData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Direct booking - no hold step
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

  // Book another — reset to step 1
  const handleBookAnother = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // Close and dismiss
  const handleClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Pre-fill date from calendar
  useEffect(() => {
    if (visible && initialDate) {
      const today = getNowInTimeZone(timeZone);
      today.setHours(0, 0, 0, 0);
      // Only pre-fill if it's not in the past
      if (initialDate >= today) {
        setBookingData((prev) => ({
          ...prev,
          date: getDateKeyInTimeZone(initialDate, timeZone),
        }));
      }
    }
  }, [visible, initialDate, timeZone]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={currentStep === 1}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      onDismiss={handleDismiss}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View style={{ flex: 1, paddingBottom: 24 }}>
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
            selectedStaffId={bookingData.staffSelected ? bookingData.staffId : undefined}
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
            onClose={handleClose}
            timeZone={timeZone}
            status={business?.auto_confirm_appointments ? 'CONFIRMED' : 'PENDING'}
          />
        )}
      </View>
    </BottomSheetModal>
  );
}
