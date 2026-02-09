import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  createService,
  updateService,
  toggleServiceActive,
  deleteService,
  getServiceStaff,
  updateServiceStaff,
  CreateServiceData,
  UpdateServiceData,
} from '@/services/services';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Service } from '@/types';

export function useServicesList(options?: { includeInactive?: boolean }) {
  const { isAuthenticated } = useAuth();
  const includeInactive = options?.includeInactive ?? false;

  const query = useQuery({
    queryKey: [...QUERY_KEYS.SERVICES, { includeInactive }],
    queryFn: () => getServices(includeInactive),
    enabled: isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
  });

  const activeServices = (query.data ?? []).filter((s) => s.is_active);
  const inactiveServices = (query.data ?? []).filter((s) => !s.is_active);

  return {
    services: query.data ?? [],
    activeServices,
    inactiveServices,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useServiceStaff(serviceId: string) {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.SERVICES, serviceId, 'staff'],
    queryFn: () => getServiceStaff(serviceId),
    enabled: isAuthenticated && !!serviceId,
    staleTime: STALE_TIME.MEDIUM,
  });

  return {
    staff: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });
}

export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, currentIsActive }: { serviceId: string; currentIsActive: boolean }) =>
      toggleServiceActive(serviceId, currentIsActive),
    onMutate: async ({ serviceId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SERVICES });

      const previousQueries = queryClient.getQueriesData<Service[]>({ queryKey: QUERY_KEYS.SERVICES });

      queryClient.setQueriesData<Service[]>(
        { queryKey: QUERY_KEYS.SERVICES },
        (old) =>
          old
            ? old.map((s) =>
                s.id === serviceId ? { ...s, is_active: !s.is_active } : s
              )
            : old
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });
}

export function useUpdateServiceStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, staffIds }: { serviceId: string; staffIds: string[] }) =>
      updateServiceStaff(serviceId, staffIds),
    onSuccess: (data, variables) => {
      if (Array.isArray(data)) {
        queryClient.setQueryData([...QUERY_KEYS.SERVICES, variables.serviceId, 'staff'], data);
      }
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.SERVICES, variables.serviceId, 'staff'],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
    },
  });
}
