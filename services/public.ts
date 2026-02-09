import api from './api';
import { Business, BusinessHour, Service } from '@/types';

// --- Public endpoints (no auth required) ---

interface PublicBusinessResponse {
  success: boolean;
  business: Business;
  hours: BusinessHour[];
}

export async function getPublicBusiness(
  businessId: string
): Promise<{ business: Business; hours: BusinessHour[] }> {
  const response = await api.get<PublicBusinessResponse>(
    `/business/public/${businessId}`
  );
  return {
    business: response.data.business,
    hours: response.data.hours ?? [],
  };
}

interface PublicServicesResponse {
  success: boolean;
  services: Service[];
}

export async function getPublicServices(businessId: string): Promise<Service[]> {
  const response = await api.get<PublicServicesResponse>(
    `/services/public/${businessId}`
  );
  return response.data.services ?? [];
}

export interface PublicStaff {
  id: string;
  name: string;
  designation: string | null;
  profile_photo_url: string | null;
}

interface PublicStaffResponse {
  success: boolean;
  staff: PublicStaff[];
}

export async function getPublicStaff(
  businessId: string,
  serviceId?: string
): Promise<PublicStaff[]> {
  const response = await api.get<PublicStaffResponse>(
    `/staff/public/${businessId}`,
    { params: serviceId ? { serviceId } : undefined }
  );
  return response.data.staff ?? [];
}
