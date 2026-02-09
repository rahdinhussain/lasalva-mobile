import api from './api';
import { Appointment, AppointmentStatus, AvailabilitySlot } from '@/types';

function normalizeAppointment(raw: any): Appointment {
  const start_time =
    raw?.start_time ??
    raw?.startTime ??
    raw?.start ??
    raw?.start_date ??
    raw?.startDate ??
    '';
  const end_time =
    raw?.end_time ??
    raw?.endTime ??
    raw?.end ??
    raw?.end_date ??
    raw?.endDate ??
    '';
  const service_id =
    raw?.service_id ?? raw?.serviceId ?? raw?.service?.id ?? raw?.service?.service_id;
  const staff_id =
    raw?.staff_id ?? raw?.staffId ?? raw?.staff?.id ?? raw?.staff?.staff_id;

  return {
    ...raw,
    start_time,
    end_time,
    service_id,
    staff_id,
    customer_name: raw?.customer_name ?? raw?.customerName ?? null,
    customer_email: raw?.customer_email ?? raw?.customerEmail ?? null,
    customer_phone: raw?.customer_phone ?? raw?.customerPhone ?? null,
  } as Appointment;
}

export interface AppointmentFilters {
  start: string; // ISO date
  end: string; // ISO date
}

export async function getAppointments(filters: AppointmentFilters): Promise<Appointment[]> {
  const response = await api.get<Appointment[] | { appointments: Appointment[] }>('/appointments', {
    params: filters,
  });
  // Handle both array and { appointments: [...] } response formats
  const data = response.data;
  const appointments = Array.isArray(data)
    ? data
    : data && Array.isArray(data.appointments)
      ? data.appointments
      : [];
  return appointments.map(normalizeAppointment);
}

export interface UpdateAppointmentStatusData {
  appointmentId: string;
  status: AppointmentStatus;
}

interface AppointmentDetailResponse {
  success?: boolean;
  appointment?: Appointment;
}

export async function updateAppointmentStatus(
  data: UpdateAppointmentStatusData
): Promise<Appointment> {
  const response = await api.patch<AppointmentDetailResponse>('/appointments', data);
  if (response.data.appointment) {
    return response.data.appointment;
  }
  return response.data as unknown as Appointment;
}

// --- Availability ---

export interface AvailabilityParams {
  serviceId: string;
  date: string; // YYYY-MM-DD
  staffId?: string;
}

export async function getAvailabilitySlots(params: AvailabilityParams): Promise<AvailabilitySlot[]> {
  const response = await api.get<{ success: boolean; slots: AvailabilitySlot[] }>(
    '/availability/slots',
    { params }
  );
  return response.data.slots ?? [];
}

// --- Direct Booking ---

export interface CreateAppointmentData {
  serviceId: string;
  startTime: string;
  endTime: string;
  staffId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  idempotencyKey: string;
}

export async function createAppointment(
  data: CreateAppointmentData
): Promise<{ appointmentId: string; assignedStaffId: string }> {
  const response = await api.post<{
    success: boolean;
    appointmentId: string;
    assignedStaffId: string;
  }>('/appointments/create', data);
  return {
    appointmentId: response.data.appointmentId,
    assignedStaffId: response.data.assignedStaffId,
  };
}

// --- Reschedule ---

export interface RescheduleAppointmentData {
  appointmentId: string;
  startTime: string;
  endTime: string;
  staffId?: string;
}

export async function rescheduleAppointment(data: RescheduleAppointmentData): Promise<void> {
  await api.post('/appointments/reschedule', data);
}

// --- Search ---

export interface AppointmentSearchParams {
  businessId: string;
  status?: AppointmentStatus;
  serviceId?: string;
  staffId?: string;
  customerName?: string;
  customerEmail?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  stats?: boolean;
}

export interface AppointmentSearchResult {
  appointments: Appointment[];
  total: number;
  statistics?: {
    statusBreakdown: Record<string, number>;
    revenue: number;
    completionRate: number;
  };
}

export async function searchAppointments(
  params: AppointmentSearchParams
): Promise<AppointmentSearchResult> {
  const response = await api.get<{ success: boolean } & AppointmentSearchResult>(
    '/appointments/search',
    { params }
  );
  const normalizedAppointments = (response.data.appointments ?? []).map(normalizeAppointment);
  return {
    appointments: normalizedAppointments,
    total: response.data.total ?? 0,
    statistics: response.data.statistics,
  };
}
