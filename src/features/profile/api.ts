import { api } from '@/lib/api-client';
import type {
  StudentAddress,
  StudentProfile,
  UploadPurpose,
  UploadResult,
} from '@/types/entities';
import type { AddressFormValues, ProfileUpdatePayload } from './schemas';

export function getMyProfile(): Promise<StudentProfile> {
  return api.get<StudentProfile>('/student-profiles/me');
}

export function updateMyProfile(payload: ProfileUpdatePayload): Promise<StudentProfile> {
  return api.patch<StudentProfile>('/student-profiles/me', payload);
}

/** 404 means "no address saved yet" — callers translate that to null. */
export function getMyAddress(): Promise<StudentAddress> {
  return api.get<StudentAddress>('/student-addresses/me');
}

export function upsertMyAddress(payload: AddressFormValues): Promise<StudentAddress> {
  return api.put<StudentAddress>('/student-addresses/me', payload);
}

/** Multipart upload — field name `file`, 5MB max, jpeg/png/webp. */
export function uploadImage(file: File, purpose: UploadPurpose): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<UploadResult>('/uploads/image', formData, { params: { purpose } });
}

export function deleteAccount(password: string): Promise<null> {
  return api.delete<null>('/auth/account', { data: { password } });
}
