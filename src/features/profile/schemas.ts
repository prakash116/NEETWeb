import { z } from 'zod';

/**
 * Form values stay strings (inputs), converted to the backend payload in
 * `toProfilePayload`. Mirrors `UpdateStudentProfileDto` / `UpsertStudentAddressDto`.
 */

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  age: z
    .string()
    .regex(/^\d*$/, 'Numbers only')
    .refine((value) => value === '' || (Number(value) >= 10 && Number(value) <= 100), {
      message: 'Age must be between 10 and 100',
    }),
  academicClass: z.string().max(30),
  schoolName: z.string().trim().max(160),
  purpose: z.string().trim().max(120),
  phoneNumber: z.string().refine((value) => value === '' || /^\+[1-9]\d{9,14}$/.test(value), {
    message: 'Use international format, e.g. +919876543210',
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export interface ProfileUpdatePayload {
  fullName?: string;
  age?: number;
  academicClass?: string;
  schoolName?: string;
  purpose?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
}

/** Empty optional fields are omitted — the backend PATCH keeps prior values. */
export function toProfilePayload(values: ProfileFormValues): ProfileUpdatePayload {
  return {
    fullName: values.fullName,
    age: values.age === '' ? undefined : Number(values.age),
    academicClass: values.academicClass || undefined,
    schoolName: values.schoolName || undefined,
    purpose: values.purpose || undefined,
    phoneNumber: values.phoneNumber || undefined,
  };
}

export const addressSchema = z.object({
  address: z.string().trim().min(3, 'Enter your street address').max(250),
  city: z.string().trim().min(1, 'Required').max(80),
  district: z.string().trim().min(1, 'Required').max(80),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  state: z.string().min(1, 'Select your state').max(80),
  country: z.string().trim().min(1, 'Required').max(80),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
