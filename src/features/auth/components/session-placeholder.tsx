'use client';

import Link from 'next/link';
import { Loader2, LogOut, UserRound } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMyProfile } from '@/features/profile/hooks';
import { initialsOf } from '@/lib/format';
import type { UserRole } from '@/types/entities';
import { useLogout, useRequireAuth } from '../hooks';

interface SessionPlaceholderProps {
  role: UserRole;
  title: string;
  description: string;
}

/** Temporary landing spot after login — replaced by the real shells in M2. */
export function SessionPlaceholder({ role, title, description }: SessionPlaceholderProps) {
  const { status, user } = useRequireAuth(role);
  const logoutMutation = useLogout();
  const profileQuery = useMyProfile(status === 'authenticated' && role === 'student');

  return (
    <div className="relative isolate flex min-h-svh items-center justify-center px-4">
      <AppBackground />

      {status !== 'authenticated' || !user || user.role !== role ? (
        <Loader2 className="size-6 animate-spin text-slate-400" aria-label="Checking session" />
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/70 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <Avatar className="mx-auto mb-4 size-16 shadow-md ring-2 ring-white/90">
            <AvatarImage src={profileQuery.data?.profilePhotoUrl} alt="" />
            <AvatarFallback className="bg-blue-50 text-lg font-semibold text-primary">
              {initialsOf(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
          <h1 className="mt-3 text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{description}</p>

          <div className="mt-5 rounded-xl border border-white/60 bg-white/70 p-4 text-left text-sm">
            <p className="font-medium text-foreground">{user.fullName}</p>
            <p className="text-slate-600">{user.email}</p>
            {user.studentId ? (
              <p className="text-slate-500 tabular-nums">{user.studentId}</p>
            ) : null}
          </div>

          {user.role === 'student' ? (
            <Button asChild className="mt-6 w-full rounded-xl">
              <Link href="/profile">
                <UserRound className="size-4" aria-hidden />
                Profile &amp; settings
              </Link>
            </Button>
          ) : null}
          <Button
            variant="outline"
            className={
              user.role === 'student'
                ? 'mt-2 w-full rounded-xl border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85'
                : 'mt-6 rounded-xl border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85'
            }
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="size-4" aria-hidden />
            {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
      )}
    </div>
  );
}
