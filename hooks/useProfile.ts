import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, UpdateProfileData } from '@/services/profile';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types';

export function useProfile() {
  const { isAuthenticated, user } = useAuth();

  const query = useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: getProfile,
    enabled: isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
    // Use auth context user as initial data to prevent blank screen
    initialData: user || undefined,
  });

  // Always show the logged-in user on "my profile": if API returned a different
  // profile (e.g. wrong cookie), prefer the auth user so staff see their own details.
  const profile =
    query.data && user && query.data.id !== user.id
      ? user
      : (query.data ?? user ?? null);

  return {
    profile,
    isLoading: query.isLoading && !user,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: (data: Profile) => {
      // Update cache with the response data immediately
      queryClient.setQueryData(QUERY_KEYS.PROFILE, data);
      // Also update the staff list cache if this profile is in it
      const staffList = queryClient.getQueryData<Profile[]>(QUERY_KEYS.STAFF);
      if (staffList && data.id) {
        const updatedList = staffList.map(staff => 
          staff.id === data.id ? data : staff
        );
        queryClient.setQueryData(QUERY_KEYS.STAFF, updatedList);
      }
    },
  });
}
