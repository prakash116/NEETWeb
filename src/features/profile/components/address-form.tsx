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
import type { StudentAddress } from '@/types/entities';
import { INDIAN_STATES } from '../constants';
import { useUpsertAddress } from '../hooks';
import { addressSchema, type AddressFormValues } from '../schemas';

export function AddressForm({ address }: { address: StudentAddress | null }) {
  const upsertMutation = useUpsertAddress();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: address?.address ?? '',
      city: address?.city ?? '',
      district: address?.district ?? '',
      pinCode: address?.pinCode ?? '',
      state: address?.state ?? '',
      country: address?.country ?? 'India',
    },
  });
  const { errors } = form.formState;
  const pending = upsertMutation.isPending;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => upsertMutation.mutate(values))}
    >
      <Field data-invalid={errors.address ? true : undefined}>
        <FieldLabel htmlFor="address">Address</FieldLabel>
        <Input
          id="address"
          autoComplete="street-address"
          placeholder="42, Green Park"
          aria-invalid={errors.address ? true : undefined}
          disabled={pending}
          {...form.register('address')}
        />
        {errors.address ? <FieldError>{errors.address.message}</FieldError> : null}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={errors.city ? true : undefined}>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <Input
            id="city"
            autoComplete="address-level2"
            placeholder="New Delhi"
            aria-invalid={errors.city ? true : undefined}
            disabled={pending}
            {...form.register('city')}
          />
          {errors.city ? <FieldError>{errors.city.message}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.district ? true : undefined}>
          <FieldLabel htmlFor="district">District</FieldLabel>
          <Input
            id="district"
            placeholder="South Delhi"
            aria-invalid={errors.district ? true : undefined}
            disabled={pending}
            {...form.register('district')}
          />
          {errors.district ? <FieldError>{errors.district.message}</FieldError> : null}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={errors.pinCode ? true : undefined}>
          <FieldLabel htmlFor="pinCode">PIN code</FieldLabel>
          <Input
            id="pinCode"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            placeholder="110016"
            aria-invalid={errors.pinCode ? true : undefined}
            disabled={pending}
            {...form.register('pinCode')}
          />
          {errors.pinCode ? <FieldError>{errors.pinCode.message}</FieldError> : null}
        </Field>

        <Field data-invalid={errors.state ? true : undefined}>
          <FieldLabel htmlFor="state">State</FieldLabel>
          <Controller
            control={form.control}
            name="state"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={pending}
              >
                <SelectTrigger id="state" className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state ? <FieldError>{errors.state.message}</FieldError> : null}
        </Field>
      </div>

      <Field data-invalid={errors.country ? true : undefined}>
        <FieldLabel htmlFor="country">Country</FieldLabel>
        <Input
          id="country"
          autoComplete="country-name"
          aria-invalid={errors.country ? true : undefined}
          disabled={pending}
          {...form.register('country')}
        />
        {errors.country ? <FieldError>{errors.country.message}</FieldError> : null}
      </Field>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={pending} className="rounded-xl px-5">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? 'Saving…' : 'Save address'}
        </Button>
      </div>
    </form>
  );
}
