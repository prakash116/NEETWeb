import { CtaAuthButton } from './auth-ctas';
import { Reveal } from './reveal';

export function CtaSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="rounded-3xl bg-primary px-6 py-14 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Start your NEET preparation today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-pretty text-blue-100">
              Create a free account and take your first timed mock in minutes.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaAuthButton />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
