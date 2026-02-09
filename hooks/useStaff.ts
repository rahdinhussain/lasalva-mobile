import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffShifts,
  createStaffShift,
  deleteStaffShift,
  CreateStaffData,
  UpdateStaffData,
  CreateShiftData,
} from '@/services/staff';
import { QUERY_KEYS, STALE_TIME } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Profile, StaffShift } from '@/types';
import { getWeekBounds } from '@/utils/dateUtils';

/** Build weekSchedule map (day 0–6 -> boolean) from shifts for current week. */
function shiftsToWeekSchedule(shifts: StaffShift[]): Record<number, boolean> {
  const week: Record<number, boolean> = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  shifts.forEach((s) => {
    const day = new Date(s.shift_date + 'T12:00:00').getDay();
    week[day] = true;
  });
  return week;
}

export function useStaffList() {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: QUERY_KEYS.STAFF,
    queryFn: () => getStaff(),
    enabled: isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  return {
    staff: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Week schedule (day 0–6 -> has shift) per staff. For staff-role viewers to show schedule preview on cards. */
export function useStaffWeekSchedules(staffIds: string[], enabled: boolean) {
  const { isAuthenticated } = useAuth();
  const { startDate, endDate } = getWeekBounds(new Date());

  const results = useQueries({
    queries: staffIds.map((staffId) => ({
      queryKey: [...QUERY_KEYS.STAFF, staffId, 'shifts', startDate, endDate],
      queryFn: () => getStaffShifts(staffId, startDate, endDate),
      enabled: enabled && isAuthenticated && staffIds.length > 0,
    })),
  });

  const scheduleByStaffId: Record<string, Record<number, boolean>> = {};
  results.forEach((res, i) => {
    const id = staffIds[i];
    if (id && res.data) scheduleByStaffId[id] = shiftsToWeekSchedule(res.data);
  });

  const isLoading = results.some((r) => r.isLoading);

  return { scheduleByStaffId, isLoading };
}

export function useStaffDetail(id: string | undefined) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get cached data from staff list for placeholder (shows immediately while fetching)
  const getPlaceholderData = (): Profile | undefined => {
    const staffList = queryClient.getQueryData<Profile[]>(QUERY_KEYS.STAFF);
    if (staffList && id) {
      return staffList.find(s => s.id === id);
    }
    return undefined;
  };

  const query = useQuery({
    queryKey: [...QUERY_KEYS.STAFF, id],
    queryFn: async () => {
      if (!id) throw new Error('Staff ID is required');
      
      // Always fetch fresh data from the API via the staff list
      const staffList = await getStaff();
      // Update the staff list cache
      queryClient.setQueryData(QUERY_KEYS.STAFF, staffList);
      
      // Find the staff from the fetched list
      const staff = staffList.find(s => s.id === id);
      if (staff) {
        return staff;
      }
      
      throw new Error('Staff member not found');
    },
    enabled: isAuthenticated && !!id,
    staleTime: STALE_TIME.SHORT, // Shorter stale time to ensure fresh data after edits
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 1,
    // Use cached data as placeholder while fetching fresh data
    placeholderData: getPlaceholderData,
  });

  return {
    staff: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) =>
      updateStaff(id, data),
    onSuccess: (updatedProfile, variables) => {
      // Update the individual staff query cache with fresh data
      queryClient.setQueryData([...QUERY_KEYS.STAFF, variables.id], updatedProfile);
      
      // Update the staff list cache if it exists
      const staffList = queryClient.getQueryData<Profile[]>(QUERY_KEYS.STAFF);
      if (staffList) {
        const updatedList = staffList.map(staff => 
          staff.id === variables.id ? updatedProfile : staff
        );
        queryClient.setQueryData(QUERY_KEYS.STAFF, updatedList);
      }
      
      // Also invalidate to ensure any other queries refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
    },
  });
}

// Fetch shifts for a specific date range
export function useStaffShifts(staffId: string, startDate: string, endDate: string) {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.STAFF, staffId, 'shifts', startDate, endDate],
    queryFn: () => getStaffShifts(staffId, startDate, endDate),
    enabled: isAuthenticated && !!staffId && !!startDate && !!endDate,
    staleTime: STALE_TIME.SHORT,
  });

  return {
    shifts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Create a one-time shift
export function useCreateStaffShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: CreateShiftData }) =>
      createStaffShift(staffId, data),
    onSuccess: (_data, variables) => {
      // Invalidate shifts queries to refetch with new shift
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.STAFF, variables.staffId, 'shifts'],
      });
    },
  });
}

// Delete a shift
export function useDeleteStaffShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, shiftId }: { staffId: string; shiftId: string }) =>
      deleteStaffShift(staffId, shiftId),
    onSuccess: (_data, variables) => {
      // Invalidate shifts queries
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.STAFF, variables.staffId, 'shifts'],
      });
    },
  });
}
