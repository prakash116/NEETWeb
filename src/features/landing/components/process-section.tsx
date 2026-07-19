import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Register free with your email and set up your student profile.',
  },
  {
    number: '02',
    title: 'Pick subject & topic',
    description: 'Choose from the full NEET syllabus organized as a topic tree.',
  },
  {
    number: '03',
    title: 'Take a timed exam',
    description: 'NEET-pattern MCQs with negative marking and a server-run clock.',
  },
  {
    number: '04',
    title: 'Review & improve',
    description: 'See correct answers, accuracy, rank, and the exact topics to fix.',
  },
];

export function ProcessSection() {
  return (
    <section id="how-it-works" className="scroll-mt-28 bg-white/55 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="From sign-up to score report"
            description="A tight loop you can repeat every day: practice, measure, fix, repeat."
          />
        </Reveal>

        <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <li className="relative h-full rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_1px_2px_rgb(15_23_42/0.06)] backdrop-blur-sm">
                <span className="text-3xl font-semibold tracking-tight text-blue-100 tabular-nums">
                  {step.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
