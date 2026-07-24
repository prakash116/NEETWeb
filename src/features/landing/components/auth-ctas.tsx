'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

function dashboardHrefFor(role: string): string {
  return role === 'admin' ? '/admin/dashboard' : '/dashboard';
}

/** Hero call-to-action row — swaps to "Go to your dashboard" once logged in. */
export function HeroCtas({ align = 'center' }: { align?: 'center' | 'start' }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const alignment = align === 'start' ? 'sm:justify-start' : 'sm:justify-center';

  if (status === 'booting') {
    return (
      <div
        className={cn(
          'mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row',
          alignment,
        )}
      >
        <Skeleton className="h-11 w-full rounded-xl sm:w-48" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-44" />
      </div>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <div className={cn('mt-8 flex justify-center', alignment)}>
        <Button size="lg" asChild className="h-11 rounded-xl px-6 text-[0.9375rem]">
          <Link href={dashboardHrefFor(user.role)}>
            Go to your dashboard
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row',
        alignment,
      )}
    >
      <Button size="lg" asChild className="h-11 w-full rounded-xl px-6 text-[0.9375rem] sm:w-auto">
        <Link href="/register">
          Start preparing free
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        asChild
        className="h-11 w-full rounded-xl border-white/80 bg-white/60 px-6 text-[0.9375rem] backdrop-blur-xl hover:bg-white/85 sm:w-auto"
      >
        <Link href="/login">I have an account</Link>
      </Button>
    </div>
  );
}

/** Bottom CTA-band button — same auth awareness on the blue surface. */
export function CtaAuthButton() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === 'booting') {
    return <Skeleton className="h-11 w-56 rounded-xl bg-white/20" />;
  }

  const authed = status === 'authenticated' && user !== null;

  return (
    <Button
      asChild
      className="h-11 rounded-xl bg-white px-6 text-[0.9375rem] text-primary hover:bg-blue-50"
    >
      <Link href={authed ? dashboardHrefFor(user.role) : '/register'}>
        {authed ? 'Go to your dashboard' : 'Create free account'}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Button>
  );
}
