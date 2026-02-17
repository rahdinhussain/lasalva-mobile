# Lasalva Mobile – Codebase Analysis (Pre-Rebuild)

## Screens

| Route | File | Purpose |
|-------|------|---------|
| **Auth** | | |
| Login | `app/(auth)/login.tsx` | Email/password login, link to forgot-password and web signup |
| Forgot Password | `app/(auth)/forgot-password.tsx` | Request reset email, success state, resend |
| Reset Password | `app/(auth)/reset-password.tsx` | New password form (token from deep link) |
| **Tabs** | | |
| Calendar | `app/(tabs)/calendar/index.tsx` | Month/Week/Day/List views, date picker, appointment detail modal, booking FAB + modal |
| Staff List | `app/(tabs)/staff/index.tsx` | Staff grid, add staff, refresh |
| Staff Add | `app/(tabs)/staff/add.tsx` | StaffForm create |
| Staff Detail | `app/(tabs)/staff/[staffId]/index.tsx` | Profile card, contact, notifications, schedule link, edit/delete |
| Staff Edit | `app/(tabs)/staff/[staffId]/edit.tsx` | StaffForm edit |
| Staff Schedule | `app/(tabs)/staff/[staffId]/schedule.tsx` | Week view vs Shift scheduler tabs |
| Services List | `app/(tabs)/services/index.tsx` | Service grid, inactive section, add service |
| Service Add | `app/(tabs)/services/add.tsx` | ServiceForm create |
| Service Detail | `app/(tabs)/services/[serviceId]/index.tsx` | Hero, details, assigned staff, assign dialog, edit/toggle/delete |
| Service Edit | `app/(tabs)/services/[serviceId]/edit.tsx` | ServiceForm edit |
| Settings | `app/(tabs)/settings/index.tsx` | Profile card, Business, Billing, Sign out |
| Profile | `app/(tabs)/settings/profile.tsx` | Photo, name, email, designation, notifications, is_bookable (admin) |
| Business | `app/(tabs)/settings/business.tsx` | Booking link, logo, name, slug, contact, hours, preferences |
| Billing | `app/(tabs)/settings/billing.tsx` | Plan, status, portal link, invoice history |

## Navigation

- **Root**: `app/_layout.tsx` → Stack with `index` and Slot for `(auth)` and `(tabs)`.
- **Auth**: `app/(auth)/_layout.tsx` → Stack (login, forgot-password, reset-password); redirect to calendar if authenticated.
- **Tabs**: `app/(tabs)/_layout.tsx` → Tabs (calendar, staff, services, settings); redirect to login if not authenticated.
- **Calendar**: `app/(tabs)/calendar/_layout.tsx` → Slot (single screen).
- **Staff**: `app/(tabs)/staff/_layout.tsx` → Stack (index, add, [staffId]/index, edit, schedule).
- **Services**: `app/(tabs)/services/_layout.tsx` → Stack (index, add, [serviceId]/index, edit).
- **Settings**: `app/(tabs)/settings/_layout.tsx` → Stack (index, profile, business, billing).

## Components

- **layout**: Header, TabBar, ScreenContainer.
- **ui**: Button, Input, Card, Badge (incl. RoleBadge), Avatar, Skeleton (SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonListItem), Select, Toggle, IconButton, EmptyState, ErrorState, ErrorBoundary, Logo.
- **booking**: BookingFAB, BookingModal, StepIndicator, ServiceStep, StaffStep, DateStep, TimeStep, CustomerDetailsStep, ConfirmationStep.
- **calendar**: DatePicker, MonthView, WeekView, DayView, DayColumn, TimeGrid, AppointmentBlock, AppointmentList, AppointmentDetail, ViewModeToggle.
- **staff**: StaffCard, WeekScheduleView, ShiftScheduler.
- **services**: ServiceCard, AssignStaffDialog.
- **forms**: StaffForm, ServiceForm.

## API Integrations

- **api.ts**: Axios instance, Bearer + cookie, 401 refresh, 429 retry, uploadFormData.
- **auth**: login, logout, refreshAuthToken, forgotPassword, resetPassword, signup, verifyOtp.
- **profile**: getProfile, updateProfile (JSON + multipart).
- **business**: getBusiness, updateBusiness (JSON + multipart), getBusinessHours, updateBusinessHours.
- **appointments**: getAppointments, updateAppointmentStatus, getAvailabilitySlots, createAppointment, rescheduleAppointment, searchAppointments.
- **staff**: getStaff, getStaffById, createStaff, updateStaff, deleteStaff, getStaffShifts, createStaffShift, deleteStaffShift.
- **services**: getServices, createService, updateService, toggleServiceActive, deleteService, getServiceStaff, updateServiceStaff.
- **billing**: getBillingSummary, openBillingPortal.
- **public**: getPublicBusiness, getPublicServices, getPublicStaff.
- **pushNotifications**: register, save/remove token, listeners (currently no-ops).

## State & Data

- **AuthContext**: user, token, userId, isLoading, isAuthenticated; login, logout, refreshUser. Hydrated from SecureStore (or in-memory in current utils/storage).
- **BusinessContext**: business, businessHours, isLoading, error, refetch. React Query (QUERY_KEYS.BUSINESS, BUSINESS_HOURS).
- **React Query**: profile, business, business hours, appointments, availability, staff, services, billing, search appointments. Mutations for create/update/delete and invalidation.

## User Flows

1. **Auth**: Open app → index redirects to (auth)/login or (tabs)/calendar. Login → calendar. Forgot password → email → reset (deep link) → login.
2. **Calendar**: View month/week/day/list, change date, open appointment detail (modal), FAB → booking modal (service → staff? → date → time → customer → confirm).
3. **Staff**: List → add or tap card → detail → edit/schedule. Schedule: week view or manage shifts.
4. **Services**: List → add or tap card → detail → assign staff (dialog), edit, toggle active, delete.
5. **Settings**: Profile / Business / Billing (role-gated), Sign out.

## Rebuild Constraints Applied

- No `react-native-reanimated` → use React Native `Animated` or no animation.
- No `@gorhom/bottom-sheet` → Booking flow in RN `Modal` + `ScrollView` / `TextInput`.
- No Hermes/New Arch/Fabric override; no custom native modules; no Podfile/Folly; no C++ libs.
- Expo managed only; latest stable Expo SDK; React Navigation (expo-router Stack/Tabs).
- All API, business logic, and flows preserved; styling kept (e.g. NativeWind/Tailwind where used).
