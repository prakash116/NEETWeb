'use client';

import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  ScrollText,
  Search,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks';
import { initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface AdminNavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  soon?: boolean;
}

interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

const GROUPS: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { label: 'Analytics', icon: BarChart3, soon: true },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Subjects & topics', icon: Library, href: '/admin/subjects' },
      { label: 'Questions', icon: FileQuestion, href: '/admin/questions' },
      { label: 'Exams', icon: ClipboardList, soon: true },
      { label: 'Students', icon: Users, soon: true },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Payments', icon: CreditCard, soon: true },
      { label: 'Wallet', icon: Wallet, soon: true },
      { label: 'SEO', icon: Search, soon: true },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Activity logs', icon: ScrollText, soon: true },
      { label: 'Settings', icon: Settings, soon: true },
    ],
  },
];

function SoonChip() {
  return (
    <span className="ml-auto rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
      Soon
    </span>
  );
}

/**
 * Floating dark-glass admin navigation. Items marked `soon` are design
 * placeholders until their modules ship.
 */
export function AdminSidebar({ active }: { active?: string }) {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  return (
    <aside className="sticky top-6 hidden h-[calc(100svh-3rem)] w-64 shrink-0 flex-col overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/85 p-4 text-slate-100 shadow-xl shadow-slate-900/20 backdrop-blur-xl lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-1" aria-label="NeetExam — home">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm leading-tight font-semibold text-white">NeetExam</span>
          <span className="block text-[11px] leading-tight text-slate-400">Admin panel</span>
        </span>
      </Link>

      <nav aria-label="Admin" className="mt-6 flex-1 space-y-5">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              {group.title}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href !== undefined && active === item.href;
                if (item.soon || !item.href) {
                  return (
                    <li key={item.label}>
                      <div
                        aria-disabled
                        className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-400"
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {item.label}
                        <SoonChip />
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        {user ? (
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
              {initialsOf(user.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
              <p className="truncate text-[11px] text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start rounded-lg px-2.5 text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-4" aria-hidden />
          {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
        </Button>
      </div>
    </aside>
  );
}
