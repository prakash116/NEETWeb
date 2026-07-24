'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState, type FocusEvent } from 'react';
import { cn } from '@/lib/utils';

interface Slide {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  footnote: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'A growth system for NEET',
    title: (
      <>
        Turn daily effort into{' '}
        <span className="bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
          visible progress
        </span>
        .
      </>
    ),
    description:
      'Read the right topic, practise under pressure, and let every result decide your next best move.',
    footnote: 'Study → Practice → Diagnose → Improve',
  },
  {
    eyebrow: 'Preparation, not guesswork',
    title: (
      <>
        Make your weakest chapter your{' '}
        <span className="bg-gradient-to-r from-violet-700 to-blue-600 bg-clip-text text-transparent">
          next breakthrough
        </span>
        .
      </>
    ),
    description:
      'Topic-level accuracy, honest exam conditions, and focused revision help you spend time where it changes marks.',
    footnote: 'Weak-topic signals after every completed attempt',
  },
  {
    eyebrow: 'Open preparation library',
    title: (
      <>
        Learn topic by topic, then{' '}
        <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
          prove what you know
        </span>
        .
      </>
    ),
    description:
      'Browse class-wise subjects, read preparation notes, download PDFs, and move into timed exams when you are ready.',
    footnote: 'Class 10 → Class 11 → Class 12 → Dropper',
  },
];

const AUTO_ADVANCE_MS = 6500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const count = SLIDES.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, paused, reducedMotion]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
  };

  const slide = SLIDES[index];

  return (
    <div
      className="w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="NEET preparation highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="flex min-h-[21rem] flex-col justify-center sm:min-h-[23rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/75 px-3.5 py-1.5 text-xs font-semibold text-blue-900 shadow-sm backdrop-blur-xl">
              <Sparkles className="size-3.5 text-teal-600" aria-hidden />
              {slide.eyebrow}
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.04] font-semibold tracking-[-0.045em] text-balance text-slate-950 sm:text-5xl lg:text-[3.65rem]">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-pretty text-slate-600 sm:text-lg">
              {slide.description}
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
              <span className="h-px w-8 bg-teal-500" aria-hidden />
              {slide.footnote}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous hero message"
            onClick={() => goTo(index - 1)}
            className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next hero message"
            onClick={() => goTo(index + 1)}
            className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-2" role="tablist" aria-label="Choose hero message">
          {SLIDES.map((item, dotIndex) => (
            <button
              key={item.eyebrow}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Show hero message ${dotIndex + 1}`}
              onClick={() => goTo(dotIndex)}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none',
                dotIndex === index
                  ? 'w-8 bg-gradient-to-r from-blue-700 to-teal-500'
                  : 'w-2 bg-slate-300 hover:bg-slate-400',
              )}
            />
          ))}
        </div>

        <span className="ml-auto font-mono text-xs text-slate-500 tabular-nums">
          0{index + 1} / 0{count}
        </span>
      </div>
    </div>
  );
}
