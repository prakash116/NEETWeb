import { z } from 'zod';

/** Mirrors `Server/src/modules/auth/dto/login.dto.ts`. */
export const loginSchema = z.object({
  email: z.email('Enter a valid email address').max(254),
  password: z.string().min(1, 'Password is required').max(72),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Same pattern the backend enforces in `RegisterDto`. */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

/** Mirrors `Server/src/modules/auth/dto/register.dto.ts` + confirm field. */
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(120),
    email: z.email('Enter a valid email address').max(254),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(72)
      .regex(PASSWORD_PATTERN, 'Add uppercase, lowercase, number, and special character'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type RegisterValues = z.infer<typeof registerSchema>;
export type RegisterPayload = Omit<RegisterValues, 'confirmPassword'>;
