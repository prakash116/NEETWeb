import Link from 'next/link';
import { ArrowUpRight, BookOpen, CheckCircle2, Orbit } from 'lucide-react';
import { CtaAuthButton } from './auth-ctas';
import { Reveal } from './reveal';

export function CtaSection() {
  return (
    <section className="bg-white px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-800 via-blue-900 to-slate-950 px-6 py-12 text-white shadow-2xl shadow-blue-950/20 sm:px-10 lg:px-14 lg:py-14">
            <div
              aria-hidden
              className="absolute -top-28 -right-20 size-80 rounded-full border border-white/10"
            />
            <div
              aria-hidden
              className="absolute -top-14 -right-6 size-52 rounded-full border border-teal-300/20"
            />
            <div
              aria-hidden
              className="absolute right-24 bottom-10 size-3 rounded-full bg-teal-300 shadow-[0_0_28px_8px_rgb(94_234_212/.3)]"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                  <Orbit className="size-3.5 text-teal-300" aria-hidden />
                  Ready for your first growth cycle?
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Your next score begins with one well-chosen topic.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-blue-100/85">
                  Start in the open preparation library, then create an account when you are
                  ready to practise, measure, and improve.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-100">
                  {['Public study library', 'Timed exam practice', 'Progress that guides you'].map(
                    (item) => (
                      <span key={item} className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-teal-300" aria-hidden />
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
                <CtaAuthButton />
                <Link
                  href="/subjects"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
                >
                  <BookOpen className="size-4" aria-hidden />
                  Explore subjects
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
