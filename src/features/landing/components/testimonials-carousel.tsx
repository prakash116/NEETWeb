'use client';

import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The topic tree gives every study session a clear starting point. I spend less time deciding and more time actually learning.',
    name: 'Class 12 learner',
    role: 'Illustrative student voice',
    initials: '12',
  },
  {
    quote:
      'The server timer makes practice feel disciplined, while auto-save lets me focus on solving instead of worrying about the browser.',
    name: 'NEET dropper learner',
    role: 'Illustrative student voice',
    initials: 'DR',
  },
  {
    quote:
      'I can open the subject library, read a topic, and download its PDF without creating an account first. That makes revision feel frictionless.',
    name: 'Class 11 learner',
    role: 'Illustrative student voice',
    initials: '11',
  },
  {
    quote:
      'A score alone can feel vague. Seeing accuracy and the topics behind my mistakes gives me one useful next action.',
    name: 'Mock-test learner',
    role: 'Illustrative student voice',
    initials: 'MT',
  },
];

const AUTOPLAY_MS = 6000;

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion = useReducedMotion();

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || reducedMotion) return;
    timerRef.current = setInterval(() => setIndex((value) => (value + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reducedMotion, count]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
  };

  return (
    <section
      id="testimonials"
      className="scroll-mt-28 overflow-hidden bg-slate-950 py-20 text-white sm:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4">
        <div
          aria-hidden
          className="absolute -top-40 -left-32 size-96 rounded-full bg-blue-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-28 -bottom-44 size-96 rounded-full bg-teal-500/15 blur-3xl"
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <Reveal>
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-teal-300">
                <MessageSquareQuote className="size-6" aria-hidden />
              </span>
              <div className="mt-6 [&_h2]:text-white [&_p]:text-slate-300">
                <SectionHeader
                  align="left"
                  eyebrow="Student experience"
                  title="Preparation should feel clear, focused, and honest"
                  description="A preview of the student voices this experience is designed to earn."
                />
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2" aria-hidden>
                  {TESTIMONIALS.slice(0, 3).map((testimonial, avatarIndex) => (
                    <span
                      key={testimonial.initials}
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full border-2 border-slate-950 text-xs font-semibold',
                        avatarIndex === 0 && 'bg-blue-100 text-blue-800',
                        avatarIndex === 1 && 'bg-teal-100 text-teal-800',
                        avatarIndex === 2 && 'bg-violet-100 text-violet-800',
                      )}
                    >
                      {testimonial.initials}
                    </span>
                  ))}
                </div>
                <div>
                  <span className="flex items-center gap-0.5" aria-label="Five-star experience goal">
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="size-3.5 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                    ))}
                  </span>
                  <p className="mt-1 text-[11px] text-slate-400">Experience goal, not a live rating</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div
              className="relative"
              role="region"
              aria-roledescription="carousel"
              aria-label="Illustrative student testimonials"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={handleBlur}
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div
                  className={cn(
                    'flex',
                    reducedMotion ? 'transition-none' : 'transition-transform duration-500 ease-out',
                  )}
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {TESTIMONIALS.map((testimonial, slideIndex) => (
                    <figure
                      key={testimonial.name}
                      className="flex min-h-[22rem] w-full shrink-0 flex-col justify-between p-7 sm:p-10"
                      aria-hidden={slideIndex !== index}
                    >
                      <div>
                        <Quote className="size-9 text-teal-300/60" aria-hidden />
                        <blockquote className="mt-6 text-xl leading-8 font-medium tracking-tight text-pretty text-white sm:text-2xl sm:leading-9">
                          “{testimonial.quote}”
                        </blockquote>
                      </div>
                      <figcaption className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-teal-200 text-sm font-bold text-slate-900">
                          {testimonial.initials}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-white">
                            {testimonial.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {testimonial.role}
                          </span>
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2" role="tablist" aria-label="Choose a student voice">
                  {TESTIMONIALS.map((testimonial, dotIndex) => (
                    <button
                      key={testimonial.initials}
                      type="button"
                      role="tab"
                      aria-selected={dotIndex === index}
                      aria-label={`Show testimonial ${dotIndex + 1}`}
                      onClick={() => goTo(dotIndex)}
                      className={cn(
                        'h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none',
                        dotIndex === index
                          ? 'w-8 bg-teal-300'
                          : 'w-2 bg-slate-700 hover:bg-slate-500',
                      )}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() => goTo(index - 1)}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
                  >
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() => goTo(index + 1)}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
                  >
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
