import type { Metadata } from "next";
import { EducationPremiumHero } from "@/components/education-premium-hero";
import { EducationPremiumAbout } from "@/components/education-premium-about";
import { EducationPremiumStats } from "@/components/education-premium-stats";
import { EducationPremiumTestimonials } from "@/components/education-premium-testimonials";
import { EducationPremiumContact } from "@/components/education-premium-contact";
import { EducationPremiumFloatingCta } from "@/components/education-premium-floating-cta";
import { EducationPremiumNav } from "@/components/education-premium-nav";
import { EducationPremiumFooter } from "@/components/education-premium-footer";

export const metadata: Metadata = {
  title: "education showcase",
  description: "Premium education digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-education-premium v2-layout-full-bleed" data-v2-package="education-premium" data-v2-composer="region-grid" data-v2-layout="full-bleed" data-v2-blueprint="bp-education-premium-education">
      <header data-v2-region="header">
      <EducationPremiumNav
        brandName={"education showcase"}
        ctaLabel={"Começar"}
        links={[{"href":"#academics","label":"Academics"},{"href":"#admissions","label":"Admissions"},{"href":"#campus","label":"Campus"},{"href":"#contact","label":"Contact"}]}
      />
      </header>
      <div data-v2-region="overlay" className="v2-overlay-canvas">
      <div data-v2-section="cta" data-v2-variant="gradient-banner">
      <EducationPremiumFloatingCta
        primaryCta={"Começar"}
        secondaryCta={"Saiba mais"}
      />
      </div>
      </div>

      <main data-v2-region="main" className="v2-main-canvas flex flex-col">
        <h1 className="v2-sr-only">education showcase</h1>
      <div data-v2-section="hero" data-v2-variant="immersive-visual">
      <EducationPremiumHero
        subtitle={"Premium education digital experience"}
        primaryCta={"Começar"}
        secondaryCta={"Saiba mais"}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <EducationPremiumAbout
      />
      </div>
      <div data-v2-section="portfolio" data-v2-variant="minimal-index">
      <EducationPremiumStats
        primaryCta={"Começar"}
        secondaryCta={"Saiba mais"}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="featured-quote">
      <EducationPremiumTestimonials
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="map-sidebar">
      <EducationPremiumContact
        ctaLabel={"Começar"}
      />
      </div>
      </main>
      <footer data-v2-region="footer">
      <EducationPremiumFooter
        brandName={"education showcase"}
        links={[{"href":"#academics","label":"Academics"},{"href":"#admissions","label":"Admissions"},{"href":"#campus","label":"Campus"},{"href":"#contact","label":"Contact"}]}
      />
      </footer>
    </div>
  );
}
