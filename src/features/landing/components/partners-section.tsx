import {
  Braces,
  Building2,
  Cloud,
  Code2,
  Database,
  GraduationCap,
  Network,
  School,
  ServerCog,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface CollaborationCategory {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Technology {
  name: string;
  role: string;
  icon: LucideIcon;
  color: string;
}

const COLLABORATION_CATEGORIES: CollaborationCategory[] = [
  {
    title: 'Schools',
    description: 'A shared preparation layer that can complement classroom learning.',
    icon: School,
  },
  {
    title: 'Coaching centres',
    description: 'Structured topic libraries and assessments for focused student support.',
    icon: Building2,
  },
  {
    title: 'Mentors',
    description: 'Clear performance signals that can guide the next student conversation.',
    icon: UsersRound,
  },
  {
    title: 'Content experts',
    description: 'A place for well-organized notes, PDFs, topics, questions, and explanations.',
    icon: GraduationCap,
  },
];

const TECHNOLOGIES: Technology[] = [
  { name: 'Next.js', role: 'Web experience', icon: Braces, color: '#0f172a' },
  { name: 'NestJS', role: 'Backend API', icon: ServerCog, color: '#e11d48' },
  { name: 'MongoDB', role: 'Data platform', icon: Database, color: '#047857' },
  { name: 'Cloudinary', role: 'Media delivery', icon: Cloud, color: '#2563eb' },
];

export function PartnersSection() {
  return (
    <section
      id="collaborations"
      aria-labelledby="collaborations-title"
      className="scroll-mt-28 bg-slate-50/75 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div id="collaborations-title">
            <SectionHeader
              eyebrow="Collaboration network"
              title="Better preparation is a team effort"
              description="NeetExam is designed to support the people and organizations around a student. These are collaboration pathways, not claims of existing commercial partnerships."
            />
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLABORATION_CATEGORIES.map((category, index) => {
            const Icon = category.icon;

            return (
              <Reveal key={category.title} delay={index * 0.08}>
                <article className="group h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgb(15_23_42/0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-foreground">{category.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {category.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-[0_24px_60px_rgb(15_23_42/0.18)]">
            <div className="grid gap-6 border-b border-white/10 px-6 py-7 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Code2 className="size-5 text-blue-200" aria-hidden />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-blue-200 uppercase">
                  Technology foundation
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Built on a production-focused web stack
                </h3>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300 lg:justify-self-end">
                These technologies power the current platform architecture. Naming them describes
                the stack and does not imply endorsement, sponsorship, or a commercial partnership.
              </p>
            </div>

            <ul className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              {TECHNOLOGIES.map((technology) => {
                const Icon = technology.icon;

                return (
                  <li
                    key={technology.name}
                    className="flex items-center gap-3 px-6 py-5 sm:[&:nth-child(3)]:border-t sm:[&:nth-child(4)]:border-t sm:[&:nth-child(3)]:border-white/10 sm:[&:nth-child(4)]:border-white/10 lg:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(4)]:border-t-0"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white"
                      style={{ color: technology.color }}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {technology.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {technology.role}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-start gap-3 border-t border-white/10 bg-white/[0.03] px-6 py-4 text-xs leading-relaxed text-slate-400 sm:px-8">
              <Network className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden />
              The collaboration categories above describe who the platform is designed to work
              with; they do not identify current partner companies.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
