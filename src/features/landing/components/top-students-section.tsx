import { Award, BookOpenCheck, Medal, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface PreviewScholar {
  rank: 1 | 2 | 3;
  name: string;
  initials: string;
  sampleAverage: number;
  sampleExams: number;
  icon: typeof Trophy;
  accent: string;
  tint: string;
  orderClass: string;
  podiumClass: string;
}

const PREVIEW_SCHOLARS: PreviewScholar[] = [
  {
    rank: 1,
    name: 'NEET Scholar 01',
    initials: '01',
    sampleAverage: 92,
    sampleExams: 12,
    icon: Trophy,
    accent: '#b7791f',
    tint: '#fffbeb',
    orderClass: 'lg:order-2',
    podiumClass: 'lg:-translate-y-6',
  },
  {
    rank: 2,
    name: 'NEET Scholar 02',
    initials: '02',
    sampleAverage: 88,
    sampleExams: 11,
    icon: Medal,
    accent: '#64748b',
    tint: '#f8fafc',
    orderClass: 'lg:order-1',
    podiumClass: '',
  },
  {
    rank: 3,
    name: 'NEET Scholar 03',
    initials: '03',
    sampleAverage: 84,
    sampleExams: 10,
    icon: Award,
    accent: '#b45309',
    tint: '#fff7ed',
    orderClass: 'lg:order-3',
    podiumClass: '',
  },
];

export function TopStudentsSection() {
  return (
    <section
      id="achievers"
      aria-labelledby="achievers-title"
      className="scroll-mt-28 bg-white/65 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div id="achievers-title">
            <SectionHeader
              eyebrow="Achievement preview"
              title="Consistency deserves a place on the podium"
              description="A focused leaderboard experience can celebrate steady practice while keeping student identity and privacy protected."
            />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto mt-7 flex max-w-2xl items-start gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/80 p-4 text-left">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-blue-950">
                Illustrative leaderboard preview
              </p>
              <p className="mt-1 text-sm leading-relaxed text-blue-900/75">
                The anonymized names and sample values below demonstrate the design only. They are
                not real student records or live rankings.
              </p>
            </div>
          </div>
        </Reveal>

        <ol
          className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-end gap-4 lg:grid-cols-3"
          aria-label="Illustrative top-three leaderboard"
        >
          {PREVIEW_SCHOLARS.map((scholar, index) => {
            const Icon = scholar.icon;

            return (
              <li
                key={scholar.rank}
                className={`${scholar.orderClass} ${scholar.podiumClass}`}
                aria-label={`Illustrative rank ${scholar.rank}: ${scholar.name}`}
              >
                <Reveal delay={index * 0.08}>
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_44px_rgb(15_23_42/0.08)]">
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1.5"
                      style={{ backgroundColor: scholar.accent }}
                    />
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <Avatar className="size-14 border-4 border-white shadow-md">
                          <AvatarFallback
                            className="font-mono text-base font-bold"
                            style={{ backgroundColor: scholar.tint, color: scholar.accent }}
                          >
                            {scholar.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white"
                          style={{ backgroundColor: scholar.accent }}
                          aria-hidden
                        >
                          {scholar.rank}
                        </span>
                      </div>
                      <span
                        className="flex size-10 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: scholar.tint, color: scholar.accent }}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                      {scholar.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Sample rank #{scholar.rank}
                    </p>

                    <dl className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <dt className="text-[11px] font-medium text-slate-500">Example average</dt>
                        <dd className="mt-1 text-xl font-semibold text-foreground tabular-nums">
                          {scholar.sampleAverage}%
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <dt className="text-[11px] font-medium text-slate-500">Example exams</dt>
                        <dd className="mt-1 text-xl font-semibold text-foreground tabular-nums">
                          {scholar.sampleExams}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                      <BookOpenCheck className="size-4 text-brand-accent" aria-hidden />
                      Consistency over one lucky result
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 text-center text-xs leading-relaxed text-slate-500">
            <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
            Live rankings should appear only when qualifying performance data and appropriate
            privacy controls are available.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
