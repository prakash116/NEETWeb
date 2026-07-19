import { SUBJECT_VISUALS } from '@/lib/labels';
import { HeroCtas } from './auth-ctas';

const SUBJECTS = [
  { code: 'PHY', name: 'Physics' },
  { code: 'CHE', name: 'Chemistry' },
  { code: 'BOT', name: 'Botany' },
  { code: 'ZOO', name: 'Zoology' },
];

export function Hero() {
  return (
    <section className="relative">
      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-xl">
          <span className="size-1.5 rounded-full bg-brand-accent" aria-hidden />
          Built for NEET aspirants
        </span>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
          Crack <span className="text-primary">NEET</span> with exam-real practice
        </h1>

        <p className="mt-5 max-w-xl text-base text-pretty text-slate-600 sm:text-lg">
          Timed exams with negative marking, topic-wise practice across all four
          subjects, and analytics that show exactly where you stand.
        </p>

        <HeroCtas />

        <div className="mt-14 w-full max-w-3xl rounded-2xl border border-white/70 bg-white/55 p-2 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SUBJECTS.map((subject) => {
              const visual = SUBJECT_VISUALS[subject.code];
              return (
                <div
                  key={subject.code}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/75 px-3 py-3"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: visual.color }}
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-foreground">{subject.name}</span>
                </div>
              );
            })}
          </div>
          <p className="px-3 pt-2.5 pb-1.5 text-xs text-slate-500">
            Server-timed exams · Negative marking · Question palette · Instant results
          </p>
        </div>
      </div>
    </section>
  );
}
