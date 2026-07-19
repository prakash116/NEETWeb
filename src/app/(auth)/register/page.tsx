import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Start your NEET preparation with structured, timed practice.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-7">
        <RegisterForm />
      </div>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
