import { useAuth } from '@/context/AuthContext';

export function useRoleAccess() {
  const { user } = useAuth();

  const role = user?.role?.toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  return {
    isAdmin,
    isStaff,
    canManageStaff: isAdmin,
    canManageServices: isAdmin,
    canManageBusiness: isAdmin,
    canViewBilling: isAdmin,
    canConfirmAppointments: true, // Both admin and staff
    canViewCalendar: true,
  };
}
