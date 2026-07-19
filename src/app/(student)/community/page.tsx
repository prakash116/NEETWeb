import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Users } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Community' };

const PLANNED = [
  'Subject-wise discussion rooms',
  'Ask and answer doubts with fellow aspirants',
  'Weekly practice leaderboards',
];

export default function CommunityPage() {
  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />
      <AppHeader active="community" />

      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-10 text-center shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            <Users className="size-7" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Community</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            A place to prepare together — discussion threads, doubt-solving, and peer leaderboards
            are on the way.
          </p>

          <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
            {PLANNED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <Button asChild className="mt-8 rounded-xl">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
