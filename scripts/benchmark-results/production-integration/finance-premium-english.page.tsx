import type { Metadata } from "next";
import { FinancePremiumHero } from "@/components/finance-premium-hero";
import { FinancePremiumAbout } from "@/components/finance-premium-about";
import { FinancePremiumTestimonials } from "@/components/finance-premium-testimonials";
import { FinancePremiumFeatures } from "@/components/finance-premium-features";
import { FinancePremiumContact } from "@/components/finance-premium-contact";
import { FinancePremiumFloatingCta } from "@/components/finance-premium-floating-cta";
import { FinancePremiumNav } from "@/components/finance-premium-nav";
import { FinancePremiumFooter } from "@/components/finance-premium-footer";

export const metadata: Metadata = {
  title: "finance showcase",
  description: "Premium finance digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-finance-premium" data-v2-package="finance-premium" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-finance-premium-finance">
      <header data-v2-region="header">
      <FinancePremiumNav
        brandName={"finance showcase"}
        ctaLabel={"Speak with an advisor"}
        links={[{"href":"#services","label":"Services"},{"href":"#approach","label":"Approach"},{"href":"#insights","label":"Insights"},{"href":"#contact","label":"Contact"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only">finance showcase</h1>
      <div data-v2-section="hero" data-v2-variant="split-trust">
      <FinancePremiumHero
        primaryCta={"Speak with an advisor"}
        secondaryCta={"Our services"}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <FinancePremiumAbout
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="logo-wall">
      <FinancePremiumTestimonials
      />
      </div>
      <div data-v2-section="features" data-v2-variant="spotlight-list">
      <FinancePremiumFeatures
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="dark-panel">
      <FinancePremiumContact
      />
      </div>
      </main>

      <footer data-v2-region="footer">
      <FinancePremiumFooter
        brandName={"finance showcase"}
        links={[{"href":"#services","label":"Services"},{"href":"#approach","label":"Approach"},{"href":"#insights","label":"Insights"},{"href":"#contact","label":"Contact"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="inline-newsletter">
      <FinancePremiumFloatingCta
      />
      </div>
      </div>
    </div>
  );
}
