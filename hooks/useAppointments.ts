import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointments,
  updateAppointmentStatus,
  searchAppointments,
  AppointmentFilters,
  UpdateAppointmentStatusData,
  AppointmentSearchParams,
} from '@/services/appointments';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Appointment, AppointmentStatus } from '@/types';
import { useServicesList } from '@/hooks/useServices';
import { useStaffList } from '@/hooks/useStaff';

export function useAppointments(filters: AppointmentFilters) {
  const { isAuthenticated } = useAuth();
  const { services } = useServicesList();
  const { staff } = useStaffList();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS, filters],
    queryFn: () => getAppointments(filters),
    enabled: isAuthenticated && !!filters.start && !!filters.end,
    staleTime: STALE_TIME.SHORT,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const serviceById = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services]
  );
  const staffById = useMemo(
    () => new Map(staff.map((member) => [member.id, member])),
    [staff]
  );
  const appointments = useMemo(() => {
    const base = query.data ?? [];
    if (base.length === 0 || (serviceById.size === 0 && staffById.size === 0)) {
      return base;
    }
    return base.map((apt) => ({
      ...apt,
      service: apt.service ?? serviceById.get(apt.service_id),
      staff: apt.staff ?? staffById.get(apt.staff_id),
    }));
  }, [query.data, serviceById, staffById]);

  return {
    appointments,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSearchAppointments(params: AppointmentSearchParams) {
  const { isAuthenticated } = useAuth();
  const { services } = useServicesList();
  const { staff } = useStaffList();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS, 'search', params],
    queryFn: () => searchAppointments(params),
    enabled: isAuthenticated && !!params.businessId,
    staleTime: STALE_TIME.SHORT,
  });

  const serviceById = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services]
  );
  const staffById = useMemo(
    () => new Map(staff.map((member) => [member.id, member])),
    [staff]
  );
  const appointments = useMemo(() => {
    const base = query.data?.appointments ?? [];
    if (base.length === 0 || (serviceById.size === 0 && staffById.size === 0)) {
      return base;
    }
    return base.map((apt) => ({
      ...apt,
      service: apt.service ?? serviceById.get(apt.service_id),
      staff: apt.staff ?? staffById.get(apt.staff_id),
    }));
  }, [query.data?.appointments, serviceById, staffById]);

  return {
    data: query.data,
    appointments,
    total: query.data?.total ?? 0,
    statistics: query.data?.statistics,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatus,
    onMutate: async (data: UpdateAppointmentStatusData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.APPOINTMENTS
      });

      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.APPOINTMENTS },
        (old: Appointment[] | { appointments?: Appointment[] } | undefined) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((apt) =>
              apt.id === data.appointmentId
                ? { ...apt, status: data.status }
                : apt
            );
          }
          if (Array.isArray(old.appointments)) {
            return {
              ...old,
              appointments: old.appointments.map((apt) =>
                apt.id === data.appointmentId
                  ? { ...apt, status: data.status }
                  : apt
              ),
            };
          }
          return old;
        }
      );

      return { previousQueries };
    },
    onError: (_err, _data, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}
