import { CheckCircle2 } from 'lucide-react';
import { SUBJECT_VISUALS } from '@/lib/labels';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

const BULLETS = [
  'Score trend across every attempt',
  'Accuracy split by subject and topic',
  'Streaks with weekly, monthly, and yearly growth',
  'Weak topics surfaced automatically',
];

const STAT_TILES = [
  { label: 'Average score', value: '68%' },
  { label: 'Accuracy', value: '75%' },
  { label: 'Streak', value: '6 days' },
];

const SUBJECT_BARS = [
  { code: 'PHY', name: 'Physics', value: 78 },
  { code: 'CHE', name: 'Chemistry', value: 64 },
  { code: 'BOT', name: 'Botany', value: 85 },
  { code: 'ZOO', name: 'Zoology', value: 71 },
];

/** Static demo data — the real dashboard ships in module M10. */
function DashboardMock() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3" aria-hidden>
        <span className="size-2.5 rounded-full bg-slate-200" />
        <span className="size-2.5 rounded-full bg-slate-200" />
        <span className="size-2.5 rounded-full bg-slate-200" />
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-3">
          {STAT_TILES.map((tile) => (
            <div key={tile.label} className="rounded-xl border border-slate-200 px-3 py-2.5">
              <p className="truncate text-[11px] font-medium text-slate-500">{tile.label}</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground tabular-nums">
                {tile.value}
              </p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-foreground">Score trend</p>
            <p className="text-xs text-slate-500">Last 8 exams</p>
          </div>
          <svg viewBox="0 0 260 84" className="mt-2 w-full" aria-hidden>
            <line x1="6" y1="25" x2="250" y2="25" stroke="#e2e8f0" strokeDasharray="3 4" />
            <line x1="6" y1="45" x2="250" y2="45" stroke="#e2e8f0" strokeDasharray="3 4" />
            <line x1="6" y1="65" x2="250" y2="65" stroke="#e2e8f0" strokeDasharray="3 4" />
            <path
              d="M6,67 L41,52 L76,59 L111,41 L145,32 L180,37 L215,23 L250,15 L250,76 L6,76 Z"
              fill="#dbeafe"
              fillOpacity="0.55"
            />
            <path
              d="M6,67 L41,52 L76,59 L111,41 L145,32 L180,37 L215,23 L250,15"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="250" cy="15" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="space-y-2.5">
          <p className="text-sm font-medium text-foreground">Accuracy by subject</p>
          {SUBJECT_BARS.map((bar) => (
            <div key={bar.code} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-slate-600">{bar.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${bar.value}%`, backgroundColor: SUBJECT_VISUALS[bar.code].color }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs font-medium text-slate-700 tabular-nums">
                {bar.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPreview() {
  return (
    <section className="bg-slate-50/70 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        <Reveal>
          <div>
            <SectionHeader
              align="left"
              eyebrow="Analytics"
              title="Know exactly where you stand"
              description="Every attempt feeds a running picture of your preparation — not just a score, but the reasons behind it."
            />
            <ul className="mt-8 space-y-3">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-accent" aria-hidden />
                  <span className="text-[15px] text-slate-700">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <DashboardMock />
        </Reveal>
      </div>
    </section>
  );
}
