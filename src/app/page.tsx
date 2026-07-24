import { AppBackground } from '@/components/common/app-background';
import { CtaSection } from '@/features/landing/components/cta-section';
import { FaqSection } from '@/features/landing/components/faq-section';
import { GrowthStrategySection } from '@/features/landing/components/growth-strategy-section';
import { Hero } from '@/features/landing/components/hero';
import { PartnersSection } from '@/features/landing/components/partners-section';
import { SiteFooter } from '@/features/landing/components/site-footer';
import { SiteHeader } from '@/features/landing/components/site-header';
import { SubjectsSection } from '@/features/landing/components/subjects-section';
import { TestimonialsCarousel } from '@/features/landing/components/testimonials-carousel';
import { TopStudentsSection } from '@/features/landing/components/top-students-section';

export default function Home() {
  return (
    <div className="relative isolate flex-1">
      <AppBackground />
      <SiteHeader />
      <main>
        <Hero />
        <SubjectsSection />
        <GrowthStrategySection />
        <TopStudentsSection />
        <PartnersSection />
        <TestimonialsCarousel />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
