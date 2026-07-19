import { AppBackground } from '@/components/common/app-background';
import { AnalyticsPreview } from '@/features/landing/components/analytics-preview';
import { CtaSection } from '@/features/landing/components/cta-section';
import { FeaturesSection } from '@/features/landing/components/features-section';
import { Hero } from '@/features/landing/components/hero';
import { ProcessSection } from '@/features/landing/components/process-section';
import { SiteFooter } from '@/features/landing/components/site-footer';
import { SiteHeader } from '@/features/landing/components/site-header';
import { SubjectsSection } from '@/features/landing/components/subjects-section';

export default function Home() {
  return (
    <div className="relative isolate flex-1">
      <AppBackground />
      <SiteHeader />
      <main>
        <Hero />
        <SubjectsSection />
        <FeaturesSection />
        <ProcessSection />
        <AnalyticsPreview />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
