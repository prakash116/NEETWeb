import { Atom, FlaskConical, Leaf, PawPrint, type LucideIcon } from 'lucide-react';
import { SUBJECT_VISUALS } from '@/lib/labels';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface SubjectCard {
  code: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

const SUBJECTS: SubjectCard[] = [
  {
    code: 'PHY',
    name: 'Physics',
    description: 'Mechanics to modern physics, with numerical-heavy practice.',
    icon: Atom,
  },
  {
    code: 'CHE',
    name: 'Chemistry',
    description: 'Physical, organic, and inorganic — chapter by chapter.',
    icon: FlaskConical,
  },
  {
    code: 'BOT',
    name: 'Botany',
    description: 'Plant physiology, morphology, genetics, and ecology.',
    icon: Leaf,
  },
  {
    code: 'ZOO',
    name: 'Zoology',
    description: 'Human physiology, reproduction, evolution, and more.',
    icon: PawPrint,
  },
];

export function SubjectsSection() {
  return (
    <section id="subjects" className="scroll-mt-28 bg-white/55 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionHeader
            eyebrow="Subjects"
            title="Everything NEET tests, organized"
            description="The full syllabus across four subjects, structured as a topic tree you can practice one branch at a time."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((subject, index) => {
            const visual = SUBJECT_VISUALS[subject.code];
            const Icon = subject.icon;
            return (
              <Reveal key={subject.code} delay={index * 0.08}>
                <div className="group h-full rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_1px_2px_rgb(15_23_42/0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <span
                    className="flex size-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: visual.tint, color: visual.color }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{subject.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {subject.description}
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
