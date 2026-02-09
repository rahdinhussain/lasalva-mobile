import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBusiness, getBusinessHours } from '@/services/business';
import { Business, BusinessHour } from '@/types';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  business: Business | null;
  businessHours: BusinessHour[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: business,
    isLoading: isLoadingBusiness,
    error: businessError,
  } = useQuery({
    queryKey: QUERY_KEYS.BUSINESS,
    queryFn: getBusiness,
    enabled: isAuthenticated,
    staleTime: STALE_TIME.LONG,
  });

  const {
    data: businessHours,
    isLoading: isLoadingHours,
    error: hoursError,
  } = useQuery({
    queryKey: QUERY_KEYS.BUSINESS_HOURS,
    queryFn: getBusinessHours,
    enabled: isAuthenticated,
    staleTime: STALE_TIME.LONG,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESS_HOURS });
  };

  const value: BusinessContextType = {
    business: business ?? null,
    businessHours: businessHours ?? [],
    isLoading: isLoadingBusiness || isLoadingHours,
    error: businessError || hoursError || null,
    refetch,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness(): BusinessContextType {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
