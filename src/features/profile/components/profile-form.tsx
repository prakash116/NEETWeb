'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StudentProfile } from '@/types/entities';
import { ACADEMIC_CLASSES } from '../constants';
import { useUpdateProfile } from '../hooks';
import { profileSchema, toProfilePayload, type ProfileFormValues } from '../schemas';

export function ProfileForm({ profile }: { profile: StudentProfile }) {
  const updateMutation = useUpdateProfile();

  const classOptions: string[] =
    profile.academicClass && !ACADEMIC_CLASSES.includes(profile.academicClass as never)
      ? [...ACADEMIC_CLASSES, profile.academicClass]
      : [...ACADEMIC_CLASSES];

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName ?? '',
      age: profile.age != null ? String(profile.age) : '',
      academicClass: profile.academicClass ?? '',
      schoolName: profile.schoolName ?? '',
      purpose: profile.purpose ?? '',
      phoneNumber: profile.phoneNumber ?? '',
    },
  });
  const { errors } = form.formState;
  const pending = updateMutation.isPending;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => updateMutation.mutate(toProfilePayload(values)))}
    >
      <Field data-invalid={errors.fullName ? true : undefined}>
        <FieldLabel htmlFor="fullName">Full name</FieldLabel>
        <Input
          id="fullName"
          autoComplete="name"
          aria-invalid={errors.fullName ? true : undefined}
          disabled={pending}
          {...form.register('fullName')}
        />
        {errors.fullName ? <FieldError>{errors.fullName.message}</FieldError> : null}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={errors.age ? true : undefined}>
          <FieldLabel htmlFor="age">Age</FieldLabel>
          <Input
            id="age"
            inputMode="numeric"
            maxLength={3}
            placeholder="18"
            aria-invalid={errors.age ? true : undefined}
            disabled={pending}
            {...form.register('age')}
          />
          {errors.age ? <FieldError>{errors.age.message}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.academicClass ? true : undefined}>
          <FieldLabel htmlFor="academicClass">Class</FieldLabel>
          <Controller
            control={form.control}
            name="academicClass"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={pending}
              >
                <SelectTrigger id="academicClass" className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.academicClass ? <FieldError>{errors.academicClass.message}</FieldError> : null}
        </Field>
      </div>

      <Field data-invalid={errors.schoolName ? true : undefined}>
        <FieldLabel htmlFor="schoolName">School name</FieldLabel>
        <Input
          id="schoolName"
          placeholder="Delhi Public School"
          aria-invalid={errors.schoolName ? true : undefined}
          disabled={pending}
          {...form.register('schoolName')}
        />
        {errors.schoolName ? <FieldError>{errors.schoolName.message}</FieldError> : null}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={errors.purpose ? true : undefined}>
          <FieldLabel htmlFor="purpose">Preparation purpose</FieldLabel>
          <Input
            id="purpose"
            placeholder="NEET 2027"
            aria-invalid={errors.purpose ? true : undefined}
            disabled={pending}
            {...form.register('purpose')}
          />
          {errors.purpose ? <FieldError>{errors.purpose.message}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.phoneNumber ? true : undefined}>
          <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
          <Input
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            placeholder="+919876543210"
            aria-invalid={errors.phoneNumber ? true : undefined}
            disabled={pending}
            {...form.register('phoneNumber')}
          />
          {errors.phoneNumber ? <FieldError>{errors.phoneNumber.message}</FieldError> : null}
        </Field>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={pending} className="rounded-xl px-5">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
