'use client';

import Link from 'next/link';
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  UserRound,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogout } from '@/features/auth/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { initialsOf } from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';

function useNavAuth() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const profileQuery = useMyProfile(status === 'authenticated' && user?.role === 'student');
  return { status, user, photoUrl: profileQuery.data?.profilePhotoUrl };
}

/** Right side of the desktop navbar: skeleton → guest buttons → avatar menu. */
export function AuthNavDesktop() {
  const { status, user, photoUrl } = useNavAuth();
  const logoutMutation = useLogout();

  if (status === 'booting') {
    return <Skeleton className="size-9 rounded-full" />;
  }

  if (status !== 'authenticated' || !user) {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild className="rounded-xl px-4">
          <Link href="/register">Get started</Link>
        </Button>
      </>
    );
  }

  const dashboardHref = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="flex items-center gap-1 rounded-full p-0.5 transition-shadow hover:ring-2 hover:ring-blue-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Avatar className="size-9 border border-slate-200">
            <AvatarImage src={photoUrl} alt="" />
            <AvatarFallback className="bg-blue-50 text-sm font-semibold text-primary">
              {initialsOf(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="size-3.5 text-slate-500" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
          <p className="truncate text-xs font-normal text-slate-500">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardHref}>
            <LayoutDashboard className="size-4" aria-hidden />
            Dashboard
          </Link>
        </DropdownMenuItem>
        {user.role === 'student' ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/exams">
                <ClipboardList className="size-4" aria-hidden />
                Schedule a test
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/community">
                <Users className="size-4" aria-hidden />
                Community
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserRound className="size-4" aria-hidden />
                Profile &amp; settings
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logoutMutation.isPending}
          className="text-destructive focus:text-destructive"
          onSelect={(event) => {
            event.preventDefault();
            logoutMutation.mutate();
          }}
        >
          <LogOut className="size-4" aria-hidden />
          {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Bottom section of the mobile sheet menu. */
export function AuthNavMobile({ onNavigate }: { onNavigate: () => void }) {
  const { status, user, photoUrl } = useNavAuth();
  const logoutMutation = useLogout();

  if (status === 'booting') {
    return (
      <div className="mt-3 border-t border-slate-200/70 pt-4">
        <Skeleton className="h-10 rounded-xl" />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return (
      <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-4">
        <Button variant="outline" asChild className="h-10 rounded-xl">
          <Link href="/login" onClick={onNavigate}>
            Log in
          </Link>
        </Button>
        <Button asChild className="h-10 rounded-xl">
          <Link href="/register" onClick={onNavigate}>
            Get started
          </Link>
        </Button>
      </div>
    );
  }

  const dashboardHref = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="mt-3 border-t border-slate-200/70 pt-4">
      <div className="flex items-center gap-3 px-1">
        <Avatar className="size-10 border border-slate-200">
          <AvatarImage src={photoUrl} alt="" />
          <AvatarFallback className="bg-blue-50 text-sm font-semibold text-primary">
            {initialsOf(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Button asChild className="h-10 rounded-xl">
          <Link href={dashboardHref} onClick={onNavigate}>
            <LayoutDashboard className="size-4" aria-hidden />
            Dashboard
          </Link>
        </Button>
        {user.role === 'student' ? (
          <Button variant="outline" asChild className="h-10 rounded-xl">
            <Link href="/profile" onClick={onNavigate}>
              <UserRound className="size-4" aria-hidden />
              Profile &amp; settings
            </Link>
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="h-10 rounded-xl text-destructive"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-4" aria-hidden />
          {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
        </Button>
      </div>
    </div>
  );
}
