import {
  Clock,
  LayoutGrid,
  ListTree,
  Save,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    title: 'Server-timed exams',
    description:
      'The countdown runs on the server, not your browser. Refreshes, crashes, and clock changes can’t bend it.',
    icon: Clock,
  },
  {
    title: 'Auto-saved answers',
    description:
      'Every selection is saved the moment you make it. Come back after a refresh exactly where you left off.',
    icon: Save,
  },
  {
    title: 'Question palette',
    description:
      'Jump to any question and see answered, unanswered, and current state at a glance — just like the real exam.',
    icon: LayoutGrid,
  },
  {
    title: 'Fair-play protection',
    description:
      'Tab switches earn three warnings; the fourth ends the attempt. Every browser event is recorded.',
    icon: ShieldCheck,
  },
  {
    title: 'Topic-wise practice',
    description:
      'Drill from subject to chapter to topic — Physics → Mechanics → Motion — and track completion as you go.',
    icon: ListTree,
  },
  {
    title: 'Performance analytics',
    description:
      'Accuracy, streaks, growth, and weak-topic detection updated after every single exam you take.',
    icon: TrendingUp,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-28 bg-slate-50/70 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionHeader
            eyebrow="Features"
            title="Practice under real exam conditions"
            description="Everything about the attempt — timing, saving, navigation, and fairness — behaves the way NEET day will."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(index % 3) * 0.08}>
                <div className="h-full rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_1px_2px_rgb(15_23_42/0.06)] backdrop-blur-sm">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
