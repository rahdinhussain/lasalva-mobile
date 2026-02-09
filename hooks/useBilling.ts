import { useQuery } from '@tanstack/react-query';
import { getBillingSummary, openBillingPortal } from '@/services/billing';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from './useRoleAccess';

export function useBillingSummary() {
  const { isAuthenticated } = useAuth();
  const { canViewBilling } = useRoleAccess();

  const query = useQuery({
    queryKey: QUERY_KEYS.BILLING,
    queryFn: getBillingSummary,
    enabled: isAuthenticated && canViewBilling,
    staleTime: STALE_TIME.MEDIUM,
  });

  return {
    billing: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export { openBillingPortal };
