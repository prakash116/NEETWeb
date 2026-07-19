'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AuthNavDesktop } from '@/components/layout/user-menu';

/** Shared chrome for admin pages: molecule backdrop + dark-glass sidebar. */
export function AdminShell({
  active,
  children,
}: {
  /** Sidebar href to highlight, e.g. "/admin/dashboard". */
  active?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 py-6">
        <AdminSidebar active={active} />

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex h-14 items-center justify-between rounded-2xl border border-white/60 bg-white/70 pr-2 pl-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl lg:hidden">
            <Link href="/" className="flex items-center gap-2.5" aria-label="NeetExam — home">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <span className="text-base font-semibold text-foreground">Admin</span>
            </Link>
            <AuthNavDesktop />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
