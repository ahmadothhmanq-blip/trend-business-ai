import type { Metadata } from "next";
import { HERO_IMAGE } from "@/lib/site-images";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroSplit } from "@/components/sections/hero-split";
import { BrandTrust } from "@/components/sections/brand-trust";
import { FeatureHighlights } from "@/components/sections/feature-highlights";
import { FeatureStorytelling } from "@/components/sections/feature-storytelling";
import { ProcessSteps } from "@/components/sections/process-steps";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { ContactSection } from "@/components/sections/contact-section";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "مكتب الراشد للمحاماة والاستشارات القانونية",
  description: "خدمات قانونية متخصصة في القضايا التجارية والاستشارات القانونية في الرياض",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased ti-topology-classic_stack">
      <SiteHeader
        brandName="مكتب الراشد للمحاماة والاستشارات القانونية"
        ctaLabel="ابدأ الآن"
        links={[]}
      />
      <HeroSplit
        title="مكتب الراشد للمحاماة والاستشارات القانونية"
        subtitle="خدمات قانونية متخصصة في القضايا التجارية والاستشارات القانونية في الرياض"
        eyebrow="تجربة متميزة"
        primaryCta="ابدأ الآن"
        secondaryCta="اعرف المزيد"
        imageUrl={HERO_IMAGE}
      />
      <BrandTrust
        eyebrow=""
        title=""
        subtitle=""
        items={[]}
        quotes={[]}
      />
      <FeatureHighlights
        eyebrow=""
        title=""
        subtitle=""
        items={[]}
        features={[]}
      />
      <FeatureStorytelling
        eyebrow=""
        title=""
        subtitle=""
        items={[]}
        features={[]}
      />
      <ProcessSteps
        eyebrow=""
        title=""
        subtitle=""
      />
      <TestimonialsCarousel
        eyebrow=""
        title=""
        subtitle=""
        items={[]}
        quotes={[]}
      />
      <FaqAccordion
        eyebrow=""
        title=""
        subtitle=""
        items={[]}
        faqs={[]}
      />
      <ContactSection
        eyebrow="تواصل معنا"
        title=""
        subtitle=""
        ctaLabel="ابدأ الآن"
      />
      <SiteFooter
        brandName="مكتب الراشد للمحاماة والاستشارات القانونية"
        tagline="خدمات قانونية متخصصة في القضايا التجارية والاستشارات القانونية في الرياض"
        links={[]}
      />

    </main>
  );
}
