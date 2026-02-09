// Core entities - connect to existing Supabase backend

// Users (auth)
export interface User {
  id: string;
  email: string;
  is_verified: boolean;
}

// Profiles (staff/admin)
export interface Profile {
  id: string;
  business_id: string;
  role: 'ADMIN' | 'STAFF';
  name: string | null;
  email: string | null;
  designation: string | null;
  is_active: boolean;
  is_bookable: boolean;
  profile_photo_url: string | null;
  notify_appointments: boolean;
  notify_shifts: boolean;
}

// Business
export interface Business {
  id: string;
  name: string;
  slug: string | null;
  timezone: string;
  logo_url: string | null;
  allow_customer_choose_staff: boolean;
  auto_confirm_appointments: boolean;
  admin_email_notifications: boolean;
  email: string | null;
  phone: string | null;
  phone_country_code: string | null;
  address_street: string | null;
  address_city: string | null;
  address_province: string | null;
  address_country: string | null;
  address_postal_code: string | null;
  slot_interval_minutes: number;
  buffer_minutes: number;
  subscription_status: 'active' | 'trialing' | 'pending' | 'canceled';
  plan_name: string | null;
}

// Services
export interface ServiceStaffAssignment {
  id: string;
  name: string;
  profile_photo_url: string | null;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  tax: number | null;
  image_url: string | null;
  deposit_required: boolean;
  deposit_amount: number | null;
  deposit_note: string | null;
  is_active: boolean;
  buffer_before_minutes: number | null;
  buffer_after_minutes: number | null;
  cancellation_min_hours_before: number | null;
  cancellation_penalty_fee: number | null;
  cancellation_penalty_percentage: number | null;
  // Assigned staff from API
  assigned_staff?: ServiceStaffAssignment[];
}

// Appointments
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  price: number | null;
  tax: number | null;
  idempotency_key: string | null;
  created_at: string;
  deleted_at: string | null;
  // Joined data
  service?: Service;
  staff?: Profile;
}

// Availability Slot
export interface AvailabilitySlot {
  time: string;
  available: boolean;
  availableStaffCount: number;
  totalStaffIds: string[];
  startTime: string;
  endTime: string;
}

// Staff Shifts (one-time shift instances)
export interface StaffShift {
  id: string;
  staff_id: string;
  shift_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  source: 'manual';
  created_at?: string;
}

// Staff Services (junction)
export interface StaffService {
  staff_id: string;
  service_id: string;
}

// Business Hours
export interface BusinessHour {
  id?: string;
  business_id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed?: boolean;
}

// API Response types
export interface AuthResponse {
  token: string;
  userId: string;
  checkoutUrl?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Staff with schedule info
export interface StaffWithSchedule extends Profile {
  shifts?: StaffShift[];
  services?: Service[];
}

// Billing types
export interface BillingSummary {
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextPaymentDate: string | null;
  amount: number | null;
  currency: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
}
