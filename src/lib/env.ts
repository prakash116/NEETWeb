import { z } from 'zod';

/**
 * Public runtime configuration. `NEXT_PUBLIC_*` values are inlined at build
 * time, so each one must be referenced explicitly (no dynamic lookup).
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .url()
    .default('https://neetexambackend-production.up.railway.app/api/v1'),
  NEXT_PUBLIC_FEATURE_PASSWORD_RESET: z.enum(['true', 'false']).default('false'),
});

const parsed = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_FEATURE_PASSWORD_RESET: process.env.NEXT_PUBLIC_FEATURE_PASSWORD_RESET,
});

export const env = {
  apiUrl: parsed.NEXT_PUBLIC_API_URL.replace(/\/+$/, ''),
  features: {
    /** Forgot/reset-password pages stay hidden until the backend ships the endpoints. */
    passwordReset: parsed.NEXT_PUBLIC_FEATURE_PASSWORD_RESET === 'true',
  },
} as const;
