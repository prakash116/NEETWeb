import { HelpCircle, MessageCircleQuestion } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface FrequentlyAskedQuestion {
  question: string;
  answer: string;
}

const FAQS: FrequentlyAskedQuestion[] = [
  {
    question: 'Can I read topics and download preparation PDFs without logging in?',
    answer:
      'Yes. Published preparation paths, subjects, topic notes, and their downloadable PDFs are available through the public subject library. An account is not required for reading preparation material.',
  },
  {
    question: 'When do I need a student account?',
    answer:
      'A student account is needed for personalized features such as taking exams, saving attempt data, viewing results, updating your profile, and tracking progress over time.',
  },
  {
    question: 'How are subjects and topics organized?',
    answer:
      'The public library begins with a published preparation path, such as a class or dropper path. Inside it, subjects open into an ordered topic hierarchy, so you can move from a broad chapter to its focused subtopics.',
  },
  {
    question: 'What happens if I refresh during a timed exam?',
    answer:
      'The exam clock is controlled by the server, and answers are saved as you work. Refreshing does not reset the deadline. If the exam time expires, the attempt is submitted automatically.',
  },
  {
    question: 'Does every exam use the same timer and negative marking?',
    answer:
      'No. Exam administrators configure the question time, marks per question, negative marks, passing marks, and question selection for each exam. The published instructions show the rules that apply to that attempt.',
  },
  {
    question: 'How does the tab-switch rule work?',
    answer:
      'During a protected exam attempt, the first three detected tab switches produce warnings. A fourth tab switch automatically fails the attempt, and exam events are recorded for auditing.',
  },
  {
    question: 'How does NeetExam help me improve weak topics?',
    answer:
      'Completed attempts feed performance summaries such as score, accuracy, correct and wrong answers, and topic progress. Use those signals to choose a smaller revision target, practice it, and compare the next result.',
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-28 bg-white/65 py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <MessageCircleQuestion className="size-6" aria-hidden />
            </span>
            <div id="faq-title" className="mt-6">
              <SectionHeader
                align="left"
                eyebrow="Frequently asked questions"
                title="Clear answers before you begin"
                description="A quick guide to public study material, student accounts, exam timing, scoring, and progress."
              />
            </div>
            <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
              <HelpCircle className="mt-0.5 size-4 shrink-0 text-brand-accent" aria-hidden />
              Content and exam availability always follow what administrators have published.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-5 shadow-[0_18px_45px_rgb(15_23_42/0.07)] sm:px-7"
          >
            {FAQS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index + 1}`}>
                <AccordionTrigger className="py-5 text-left text-[15px] leading-snug font-semibold text-foreground hover:no-underline sm:text-base">
                  <span className="flex items-start gap-3 pr-3">
                    <span className="mt-0.5 font-mono text-xs font-semibold text-blue-300 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pr-8 pb-5 pl-9 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
