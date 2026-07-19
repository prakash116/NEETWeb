'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { PasswordInput } from '@/components/common/password-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useRegister } from '../hooks';
import { registerSchema, type RegisterValues } from '../schemas';

const REQUIREMENTS: { label: string; test: (value: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One special character', test: (value) => /[^A-Za-z\d]/.test(value) },
];

function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul aria-label="Password requirements" className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {REQUIREMENTS.map((requirement) => {
        const met = requirement.test(value);
        return (
          <li
            key={requirement.label}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              met ? 'text-green-700' : 'text-slate-500',
            )}
          >
            {met ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <span className="mx-1 inline-block size-1.5 rounded-full bg-slate-300" aria-hidden />
            )}
            {requirement.label}
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterForm() {
  const registerMutation = useRegister();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });
  const { errors } = form.formState;
  const passwordValue = useWatch({ control: form.control, name: 'password', defaultValue: '' });

  const apiError = registerMutation.error instanceof ApiError ? registerMutation.error : null;
  const emailTaken = apiError?.status === 409;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit(({ fullName, email, password }) =>
        registerMutation.mutate({ fullName, email, password }),
      )}
    >
      {apiError ? (
        <Alert variant="destructive">
          <AlertTitle>Registration failed</AlertTitle>
          <AlertDescription>
            {apiError.message}
            {emailTaken ? (
              <>
                {' '}
                <Link href="/login" className="font-medium underline underline-offset-2">
                  Log in instead
                </Link>
              </>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Field data-invalid={errors.fullName ? true : undefined}>
        <FieldLabel htmlFor="fullName">Full name</FieldLabel>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Ananya Sharma"
          aria-invalid={errors.fullName ? true : undefined}
          disabled={registerMutation.isPending}
          {...form.register('fullName')}
        />
        {errors.fullName ? <FieldError>{errors.fullName.message}</FieldError> : null}
      </Field>

      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          disabled={registerMutation.isPending}
          {...form.register('email')}
        />
        {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
      </Field>

      <Field data-invalid={errors.password ? true : undefined}>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          aria-invalid={errors.password ? true : undefined}
          disabled={registerMutation.isPending}
          {...form.register('password')}
        />
        <PasswordRequirements value={passwordValue} />
        {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
      </Field>

      <Field data-invalid={errors.confirmPassword ? true : undefined}>
        <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          disabled={registerMutation.isPending}
          {...form.register('confirmPassword')}
        />
        {errors.confirmPassword ? <FieldError>{errors.confirmPassword.message}</FieldError> : null}
      </Field>

      <Button
        type="submit"
        disabled={registerMutation.isPending}
        className="h-11 w-full rounded-xl text-[0.9375rem]"
      >
        {registerMutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {registerMutation.isPending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
