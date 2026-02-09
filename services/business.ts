import api, { uploadFormData } from './api';
import { Business, BusinessHour } from '@/types';

interface BusinessResponse {
  success?: boolean;
  business?: Business;
}

interface BusinessHoursResponse {
  success?: boolean;
  hours?: BusinessHour[];
}

export async function getBusiness(): Promise<Business> {
  const response = await api.get<BusinessResponse>('/business');
  // Handle both wrapped and unwrapped response formats
  if (response.data.business) {
    return response.data.business;
  }
  return response.data as unknown as Business;
}

export interface UpdateBusinessData {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  address_street?: string;
  address_city?: string;
  address_province?: string;
  address_country?: string;
  address_postal_code?: string;
  allow_customer_choose_staff?: boolean;
  auto_confirm_appointments?: boolean;
  admin_email_notifications?: boolean;
  logo?: {
    uri: string;
    type: string;
    name: string;
  };
}

export async function updateBusiness(data: UpdateBusinessData): Promise<Business> {
  if (data.logo) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logo' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    formData.append('logo', {
      uri: data.logo.uri,
      type: data.logo.type,
      name: data.logo.name,
    } as any);
    
    return uploadFormData('/business', formData);
  }
  
  const response = await api.put<BusinessResponse>('/business', data);
  if (response.data.business) {
    return response.data.business;
  }
  return response.data as unknown as Business;
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  const response = await api.get<BusinessHoursResponse>('/business/hours');
  // Handle both wrapped and unwrapped response formats
  if (response.data.hours) {
    return response.data.hours;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

export async function updateBusinessHours(hours: BusinessHour[]): Promise<BusinessHour[]> {
  // Transform to API expected format (camelCase with isOpen flag)
  // The API filters by isOpen, so we must include it
  const apiHours = hours.map((h) => ({
    dayOfWeek: h.day_of_week,
    openTime: h.open_time,
    closeTime: h.close_time,
    isOpen: true, // Only open days are passed to this function
  }));

  const response = await api.post<BusinessHoursResponse>('/business/hours', { hours: apiHours });
  if (response.data.hours) {
    return response.data.hours;
  }
  return response.data as unknown as BusinessHour[];
}
