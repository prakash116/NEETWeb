'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequireAuth } from '@/features/auth/hooks';
import { useMyAddress, useMyProfile } from '../hooks';
import { AddressForm } from './address-form';
import { DangerZone } from './danger-zone';
import { ProfileCard } from './profile-card';
import { ProfileForm } from './profile-form';

const GLASS_PANEL =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <Skeleton className="h-80 rounded-2xl bg-white/50" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-64 rounded-xl bg-white/50" />
        <Skeleton className="h-96 rounded-2xl bg-white/50" />
      </div>
    </div>
  );
}

export function ProfileView() {
  const { status } = useRequireAuth('student');
  const authed = status === 'authenticated';
  const profileQuery = useMyProfile(authed);
  const addressQuery = useMyAddress(authed);

  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/60 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl transition-colors hover:bg-white/85 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to dashboard
        </Link>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          Profile &amp; settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Complete your student profile — it appears on your results and reports.
        </p>

        <div className="mt-6">
          {!authed || profileQuery.isPending ? (
            <PageSkeleton />
          ) : profileQuery.isError ? (
            <div className={`${GLASS_PANEL} p-10 text-center`}>
              <p className="text-sm text-slate-600">Could not load your profile.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
                onClick={() => void profileQuery.refetch()}
              >
                <RotateCw className="size-4" aria-hidden />
                Try again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_1fr]">
              <ProfileCard profile={profileQuery.data} />

              <Tabs defaultValue="profile">
                <TabsList className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-xl">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className={`${GLASS_PANEL} mt-4 p-6`}>
                  <ProfileForm profile={profileQuery.data} />
                </TabsContent>

                <TabsContent value="address" className={`${GLASS_PANEL} mt-4 p-6`}>
                  {addressQuery.isPending ? (
                    <div className="space-y-4">
                      <Skeleton className="h-9 rounded-lg bg-white/50" />
                      <Skeleton className="h-9 rounded-lg bg-white/50" />
                      <Skeleton className="h-9 rounded-lg bg-white/50" />
                    </div>
                  ) : (
                    <AddressForm address={addressQuery.data ?? null} />
                  )}
                </TabsContent>

                <TabsContent value="security" className="mt-4">
                  <DangerZone />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
