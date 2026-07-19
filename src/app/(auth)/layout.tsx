import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh flex-1 flex-col">
      <AppBackground />
      <div className="mx-auto w-full max-w-6xl px-4 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
