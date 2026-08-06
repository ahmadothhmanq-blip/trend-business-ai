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
        ctaLabel={"Apply now"}
        links={[{"href":"#services","label":"Programs"},{"href":"#features","label":"Approach"},{"href":"#pricing","label":"Tuition"},{"href":"#testimonials","label":"Alumni"},{"href":"#contact","label":"Apply"}]}
      />
      </header>
      <div data-v2-region="overlay" className="v2-overlay-canvas">
      <div data-v2-section="cta" data-v2-variant="gradient-banner">
      <EducationPremiumFloatingCta
        primaryCta={"Apply now"}
        secondaryCta={"Explore programs"}
        title={"Start your application"}
        subtitle={"Explore programs and submit interest — admissions follows up quickly."}
      />
      </div>
      </div>

      <main data-v2-region="main" className="v2-main-canvas flex flex-col">
        <h1 className="v2-sr-only">education showcase</h1>
      <div data-v2-section="hero" data-v2-variant="immersive-visual">
      <EducationPremiumHero
        subtitle={"Premium education digital experience"}
        eyebrow={"Outcome-focused learning"}
        primaryCta={"Apply now"}
        secondaryCta={"Explore programs"}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <EducationPremiumAbout
        eyebrow={"Programs"}
        title={"Learn with a finish line in mind"}
        subtitle={"Education marketing that sells outcomes — not vague inspiration."}
      />
      </div>
      <div data-v2-section="portfolio" data-v2-variant="minimal-index">
      <EducationPremiumStats
        primaryCta={"Apply now"}
        secondaryCta={"Explore programs"}
        title={"Start your application"}
        subtitle={"Explore programs and submit interest — admissions follows up quickly."}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="featured-quote">
      <EducationPremiumTestimonials
        eyebrow={"Alumni"}
        title={"Results students can point to"}
        subtitle={"Stories tied to portfolios, jobs, and confidence."}
        items={[{"quote":"I shipped a portfolio project that actually got interview callbacks — working with education showcase.","name":"Dev Patel","role":"Graduate"},{"quote":"The pacing respected that I work full time.","name":"Sara Nguyen","role":"Student"},{"quote":"Admissions made requirements and deadlines crystal clear.","name":"Leo Martins","role":"Applicant"}]}
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="map-sidebar">
      <EducationPremiumContact
        title={"Talk to admissions"}
        subtitle={"Questions about fit, deadlines, or scholarships? Ask us."}
        ctaLabel={"Apply now"}
      />
      </div>
      </main>
      <footer data-v2-region="footer">
      <EducationPremiumFooter
        brandName={"education showcase"}
        tagline={"Programs, mentors, and a clear path from enrollment to results."}
        links={[{"href":"#services","label":"Programs"},{"href":"#features","label":"Approach"},{"href":"#pricing","label":"Tuition"},{"href":"#testimonials","label":"Alumni"},{"href":"#contact","label":"Apply"}]}
      />
      </footer>
    </div>
  );
}
