import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FileQuestion,
  LayoutDashboard,
  Library,
  ListTree,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  /** Omitted for the ungrouped overview section. */
  title?: string;
  items: NavItem[];
}

export const studentNav: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Subjects', href: '/subjects', icon: BookOpen },
  { title: 'Exams', href: '/exams', icon: ClipboardList },
  { title: 'Results', href: '/results', icon: BarChart3 },
  { title: 'Notifications', href: '/notifications', icon: Bell },
  { title: 'Profile', href: '/profile', icon: UserRound },
];

export const adminNav: NavGroup[] = [
  {
    items: [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Content',
    items: [
      { title: 'Subjects', href: '/admin/subjects', icon: Library },
      { title: 'Topics', href: '/admin/topics', icon: ListTree },
      { title: 'Questions', href: '/admin/questions', icon: FileQuestion },
      { title: 'Imports', href: '/admin/questions/imports', icon: Upload },
    ],
  },
  {
    title: 'Assessment',
    items: [{ title: 'Exams', href: '/admin/exams', icon: ClipboardList }],
  },
  {
    title: 'People',
    items: [
      { title: 'Students', href: '/admin/students', icon: Users },
      { title: 'Administrators', href: '/admin/admins', icon: ShieldCheck },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Notifications', href: '/admin/notifications', icon: Megaphone },
      { title: 'Activity logs', href: '/admin/logs', icon: ScrollText },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

/**
 * Longest-matching nav href wins, so `/admin/questions/imports` activates the
 * Imports item without also activating Questions.
 */
export function activeNavHref(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}
