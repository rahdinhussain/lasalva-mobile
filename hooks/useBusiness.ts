import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  updateBusiness, 
  updateBusinessHours, 
  UpdateBusinessData 
} from '@/services/business';
import { QUERY_KEYS } from '@/constants';
import { useBusiness as useBusinessContext } from '@/context/BusinessContext';
import { BusinessHour } from '@/types';

// Re-export the context hook for convenience
export { useBusinessContext as useBusiness };

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESS });
    },
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESS_HOURS });
    },
  });
}
