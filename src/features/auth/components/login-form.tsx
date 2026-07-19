'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PasswordInput } from '@/components/common/password-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api-client';
import { env } from '@/lib/env';
import { useLogin } from '../hooks';
import { loginSchema, type LoginValues } from '../schemas';

export function LoginForm() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  const loginMutation = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { errors } = form.formState;

  const apiError = loginMutation.error instanceof ApiError ? loginMutation.error : null;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
    >
      {sessionExpired && !apiError && !loginMutation.isPending ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertDescription className="text-amber-900">
            Your session expired — please log in again.
          </AlertDescription>
        </Alert>
      ) : null}

      {apiError ? (
        <Alert variant="destructive">
          <AlertTitle>Login failed</AlertTitle>
          <AlertDescription>{apiError.message}</AlertDescription>
        </Alert>
      ) : null}

      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          disabled={loginMutation.isPending}
          {...form.register('email')}
        />
        {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
      </Field>

      <Field data-invalid={errors.password ? true : undefined}>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          {env.features.passwordReset ? (
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={errors.password ? true : undefined}
          disabled={loginMutation.isPending}
          {...form.register('password')}
        />
        {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
      </Field>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="h-11 w-full rounded-xl text-[0.9375rem]"
      >
        {loginMutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {loginMutation.isPending ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}
