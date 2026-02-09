import api, { uploadFormData } from './api';
import { Service, Profile } from '@/types';

interface ServicesListResponse {
  success?: boolean;
  services?: Service[];
}

interface ServiceDetailResponse {
  success?: boolean;
  service?: Service;
}

interface ServiceStaffResponse {
  success?: boolean;
  staff?: Profile[];
  staffIds?: string[];
}

export async function getServices(includeInactive: boolean = false): Promise<Service[]> {
  const response = await api.get<ServicesListResponse>('/services', {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  if (response.data.services) {
    return response.data.services;
  }
  return response.data as unknown as Service[];
}

export interface CreateServiceData {
  name: string;
  duration_minutes: number;
  price?: number;
  tax?: number;
  deposit_required?: boolean;
  deposit_amount?: number;
  deposit_note?: string;
  image?: {
    uri: string;
    type: string;
    name: string;
  };
}

export async function createService(data: CreateServiceData): Promise<Service> {
  // Transform to API expected format (camelCase)
  const apiData = {
    name: data.name,
    durationMinutes: data.duration_minutes,
    price: data.price,
    tax: data.tax,
    depositRequired: data.deposit_required,
    depositAmount: data.deposit_amount,
    depositNote: data.deposit_note,
  };

  if (data.image) {
    const formData = new FormData();

    formData.append('name', apiData.name);
    formData.append('durationMinutes', String(apiData.durationMinutes));

    if (apiData.price !== undefined) formData.append('price', String(apiData.price));
    if (apiData.tax !== undefined) formData.append('tax', String(apiData.tax));
    if (apiData.depositRequired !== undefined) {
      formData.append('depositRequired', String(apiData.depositRequired));
    }
    if (apiData.depositAmount !== undefined) {
      formData.append('depositAmount', String(apiData.depositAmount));
    }
    if (apiData.depositNote) formData.append('depositNote', apiData.depositNote);

    formData.append('image', {
      uri: data.image.uri,
      type: data.image.type,
      name: data.image.name,
    } as any);

    return uploadFormData('/services', formData, 'POST');
  }

  const response = await api.post<ServiceDetailResponse>('/services', apiData);
  if (response.data.service) {
    return response.data.service;
  }
  return response.data as unknown as Service;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}

export async function updateService(data: UpdateServiceData): Promise<Service> {
  const { id, image, ...rest } = data;

  // Transform to API expected format (camelCase)
  const apiData: Record<string, any> = {
    serviceId: id,
    name: rest.name,
    durationMinutes: rest.duration_minutes,
    price: rest.price,
    tax: rest.tax,
    depositRequired: rest.deposit_required,
    depositAmount: rest.deposit_amount,
    depositNote: rest.deposit_note,
  };

  // Remove undefined values
  Object.keys(apiData).forEach((key) => {
    if (apiData[key] === undefined) {
      delete apiData[key];
    }
  });

  if (image) {
    const formData = new FormData();
    formData.append('serviceId', id);

    if (apiData.name !== undefined) formData.append('name', apiData.name);
    if (apiData.durationMinutes !== undefined)
      formData.append('durationMinutes', String(apiData.durationMinutes));
    if (apiData.price !== undefined) formData.append('price', String(apiData.price));
    if (apiData.tax !== undefined) formData.append('tax', String(apiData.tax));
    if (apiData.depositRequired !== undefined)
      formData.append('depositRequired', String(apiData.depositRequired));
    if (apiData.depositAmount !== undefined)
      formData.append('depositAmount', String(apiData.depositAmount));
    if (apiData.depositNote !== undefined) formData.append('depositNote', apiData.depositNote);

    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.name,
    } as any);

    return uploadFormData('/services', formData);
  }

  const response = await api.put<ServiceDetailResponse>('/services', apiData);
  if (response.data.service) {
    return response.data.service;
  }
  return response.data as unknown as Service;
}

export async function toggleServiceActive(
  serviceId: string,
  currentIsActive: boolean
): Promise<Service> {
  // API requires both serviceId and isActive (the new state, not current)
  const response = await api.patch<ServiceDetailResponse>('/services', {
    serviceId,
    isActive: !currentIsActive,
  });
  if (response.data.service) {
    return response.data.service;
  }
  return response.data as unknown as Service;
}

export async function deleteService(serviceId: string): Promise<void> {
  await api.delete('/services', { params: { serviceId } });
}

export async function getServiceStaff(serviceId: string): Promise<Profile[]> {
  const response = await api.get<ServiceStaffResponse>(`/services/${serviceId}/staff`);
  if (response.data.staff) {
    return response.data.staff;
  }
  return response.data as unknown as Profile[];
}

export async function updateServiceStaff(
  serviceId: string,
  staffIds: string[]
): Promise<Profile[]> {
  const response = await api.put<ServiceStaffResponse>(`/services/${serviceId}/staff`, { staffIds });
  if (response.data.staff) {
    return response.data.staff;
  }
  return [];
}
