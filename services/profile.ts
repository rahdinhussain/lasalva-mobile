import api, { uploadFormData } from './api';
import { Profile } from '@/types';

interface ProfileResponse {
  success?: boolean;
  profile?: Profile;
}

export async function getProfile(): Promise<Profile> {
  const response = await api.get<ProfileResponse>('/profile');
  // Handle both wrapped and unwrapped response formats
  if (response.data.profile) {
    return response.data.profile;
  }
  return response.data as unknown as Profile;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  designation?: string;
  notify_appointments?: boolean;
  notify_shifts?: boolean;
  is_bookable?: boolean;
  photo?: {
    uri: string;
    type: string;
    name: string;
  };
}

export async function updateProfile(data: UpdateProfileData): Promise<Profile> {
  // If there's a photo, use multipart form data
  if (data.photo) {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.designation) formData.append('designation', data.designation);
    if (data.notify_appointments !== undefined) {
      formData.append('notify_appointments', String(data.notify_appointments));
    }
    if (data.notify_shifts !== undefined) {
      formData.append('notify_shifts', String(data.notify_shifts));
    }
    if (data.is_bookable !== undefined) {
      formData.append('is_bookable', String(data.is_bookable));
    }
    
    formData.append('photo', {
      uri: data.photo.uri,
      type: data.photo.type,
      name: data.photo.name,
    } as any);
    
    // uploadFormData returns the profile directly
    return uploadFormData('/profile', formData);
  }
  
  // Build clean payload without undefined values for JSON request
  const payload: Record<string, any> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.designation !== undefined) payload.designation = data.designation;
  if (data.notify_appointments !== undefined) payload.notify_appointments = data.notify_appointments;
  if (data.notify_shifts !== undefined) payload.notify_shifts = data.notify_shifts;
  if (data.is_bookable !== undefined) payload.is_bookable = data.is_bookable;
  
  const response = await api.put<ProfileResponse>('/profile', payload);
  if (response.data.profile) {
    return response.data.profile;
  }
  return response.data as unknown as Profile;
}
