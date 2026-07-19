import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { GraduationCap } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Log in to continue your NEET preparation.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-7">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-5 text-center text-sm text-slate-600">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
