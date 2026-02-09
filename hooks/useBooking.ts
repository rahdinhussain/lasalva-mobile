import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailabilitySlots,
  createAppointment,
  CreateAppointmentData,
} from '@/services/appointments';
import { getPublicStaff } from '@/services/public';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from '@/context/AuthContext';

export function useAvailabilitySlots(
  serviceId: string | undefined,
  date: string | undefined,
  staffId?: string
) {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.AVAILABILITY, serviceId, date, staffId],
    queryFn: () =>
      getAvailabilitySlots({
        serviceId: serviceId!,
        date: date!,
        staffId,
      }),
    enabled: isAuthenticated && !!serviceId && !!date,
    staleTime: STALE_TIME.SHORT,
    gcTime: 1000 * 60 * 2,
  });

  return {
    slots: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useBookingStaff(
  businessId: string | undefined,
  serviceId: string | undefined
) {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.STAFF, 'public', businessId, serviceId],
    queryFn: () => getPublicStaff(businessId!, serviceId),
    enabled: isAuthenticated && !!businessId && !!serviceId,
    staleTime: STALE_TIME.MEDIUM,
  });

  return {
    staff: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateAppointmentData, 'idempotencyKey'>) => {
      const idempotencyKey = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      return createAppointment({ ...data, idempotencyKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AVAILABILITY });
    },
  });
}
