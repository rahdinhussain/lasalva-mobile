import api, { uploadFormData } from './api';
import { Profile, StaffShift } from '@/types';

interface StaffListResponse {
  success: boolean;
  staff: Profile[];
}

interface StaffDetailResponse {
  success: boolean;
  staff: Profile;
}

interface StaffShiftsResponse {
  success: boolean;
  shifts: StaffShift[];
}

export async function getStaff(): Promise<Profile[]> {
  const response = await api.get<StaffListResponse>('/staff');
  return response.data.staff;
}

export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  designation?: string;
  notify_appointments?: boolean;
  notify_shifts?: boolean;
  photo?: {
    uri: string;
    type: string;
    name: string;
  };
}

export async function createStaff(data: CreateStaffData): Promise<Profile> {
  // If there's a photo, use multipart form data
  if (data.photo && data.photo.uri) {
    const formData = new FormData();
    
    // Add required fields
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.designation) formData.append('designation', data.designation);
    
    // Add notification preferences
    if (data.notify_appointments !== undefined) {
      formData.append('notify_appointments', String(data.notify_appointments));
    }
    if (data.notify_shifts !== undefined) {
      formData.append('notify_shifts', String(data.notify_shifts));
    }
    
    // Add photo - ensure clean object structure for React Native
    const photoObject = {
      uri: data.photo.uri,
      type: data.photo.type || 'image/jpeg',
      name: data.photo.name || 'photo.jpg',
    };
    formData.append('photo', photoObject as any);
    
    // uploadFormData returns the staff profile directly
    return uploadFormData('/staff', formData, 'POST');
  }
  
  // Build clean payload for JSON request
  const payload: Record<string, any> = {
    name: data.name,
    email: data.email,
    password: data.password,
  };
  if (data.designation !== undefined) payload.designation = data.designation;
  if (data.notify_appointments !== undefined) payload.notify_appointments = data.notify_appointments;
  if (data.notify_shifts !== undefined) payload.notify_shifts = data.notify_shifts;
  
  const response = await api.post<StaffDetailResponse>('/staff', payload);
  return response.data.staff;
}

export async function getStaffById(id: string): Promise<Profile> {
  const response = await api.get<StaffDetailResponse>(`/staff/${id}`);
  // Handle both wrapped and unwrapped response formats
  if (response.data.staff) {
    return response.data.staff;
  }
  return response.data as unknown as Profile;
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
  password?: string;
  designation?: string;
  is_active?: boolean;
  notify_appointments?: boolean;
  notify_shifts?: boolean;
  photo?: {
    uri: string;
    type: string;
    name: string;
  };
}

export async function updateStaff(id: string, data: UpdateStaffData): Promise<Profile> {
  // If there's a photo, use multipart form data
  if (data.photo && data.photo.uri) {
    const formData = new FormData();
    
    // Add text fields
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);
    if (data.designation) formData.append('designation', data.designation);
    if (data.notify_appointments !== undefined) {
      formData.append('notify_appointments', String(data.notify_appointments));
    }
    if (data.notify_shifts !== undefined) {
      formData.append('notify_shifts', String(data.notify_shifts));
    }
    
    // Add photo - ensure clean object structure for React Native
    const photoObject = {
      uri: data.photo.uri,
      type: data.photo.type || 'image/jpeg',
      name: data.photo.name || 'photo.jpg',
    };
    formData.append('photo', photoObject as any);
    
    // uploadFormData returns the staff profile directly
    return uploadFormData(`/staff/${id}`, formData);
  }
  
  // Build clean payload without undefined values for JSON request
  const payload: Record<string, any> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.password !== undefined) payload.password = data.password;
  if (data.designation !== undefined) payload.designation = data.designation;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  if (data.notify_appointments !== undefined) payload.notify_appointments = data.notify_appointments;
  if (data.notify_shifts !== undefined) payload.notify_shifts = data.notify_shifts;
  
  const response = await api.put<StaffDetailResponse>(`/staff/${id}`, payload);
  return response.data.staff;
}

export async function deleteStaff(id: string): Promise<void> {
  await api.delete(`/staff/${id}`);
}

// Fetch shifts for a specific date range
export async function getStaffShifts(
  id: string,
  startDate: string,
  endDate: string
): Promise<StaffShift[]> {
  const response = await api.get<StaffShiftsResponse>(
    `/staff/${id}/schedule?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data.shifts || [];
}

// Create a one-time shift
export interface CreateShiftData {
  shiftDate: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

interface CreateShiftResponse {
  success: boolean;
  shift: StaffShift;
  action: 'created' | 'updated' | 'unchanged';
}

export async function createStaffShift(
  staffId: string,
  data: CreateShiftData
): Promise<{ shift: StaffShift; action: string }> {
  const response = await api.post<CreateShiftResponse>(
    `/staff/${staffId}/schedule`,
    {
      shiftDate: data.shiftDate,
      startTime: data.startTime,
      endTime: data.endTime,
    }
  );
  return { shift: response.data.shift, action: response.data.action };
}

// Delete a shift
export async function deleteStaffShift(
  staffId: string,
  shiftId: string
): Promise<void> {
  await api.delete(`/staff/${staffId}/schedule?shiftId=${shiftId}`);
}
