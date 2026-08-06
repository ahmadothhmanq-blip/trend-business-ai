import type { Metadata } from "next";
import { CorporateBusinessHero } from "@/components/corporate-business-hero";
import { CorporateBusinessAbout } from "@/components/corporate-business-about";
import { CorporateBusinessTestimonials } from "@/components/corporate-business-testimonials";
import { CorporateBusinessStats } from "@/components/corporate-business-stats";
import { CorporateBusinessFeatures } from "@/components/corporate-business-features";
import { CorporateBusinessContact } from "@/components/corporate-business-contact";
import { CorporateBusinessFloatingCta } from "@/components/corporate-business-floating-cta";
import { CorporateBusinessNav } from "@/components/corporate-business-nav";
import { CorporateBusinessFooter } from "@/components/corporate-business-footer";

export const metadata: Metadata = {
  title: "corporate showcase",
  description: "Premium corporate digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-corporate-business" data-v2-package="corporate-business" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-corporate-business-corporate">
      <header data-v2-region="header">
      <CorporateBusinessNav
        brandName={"corporate showcase"}
        ctaLabel={"ابدأ الآن"}
        links={[{"href":"#about","label":"الخدمات"},{"href":"#features","label":"المميزات"},{"href":"#customers","label":"الأسعار"},{"href":"#contact","label":"تواصل معنا"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only">corporate showcase</h1>
      <div data-v2-section="hero" data-v2-variant="split-trust">
      <CorporateBusinessHero
        subtitle={"Premium corporate digital experience"}
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <CorporateBusinessAbout
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="logo-wall">
      <CorporateBusinessTestimonials
      />
      </div>
      <div data-v2-section="services" data-v2-variant="process-rail">
      <CorporateBusinessStats
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <CorporateBusinessFeatures
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="dark-panel">
      <CorporateBusinessContact
        ctaLabel={"ابدأ الآن"}
      />
      </div>
      </main>

      <footer data-v2-region="footer">
      <CorporateBusinessFooter
        brandName={"corporate showcase"}
        links={[{"href":"#about","label":"الخدمات"},{"href":"#features","label":"المميزات"},{"href":"#customers","label":"الأسعار"},{"href":"#contact","label":"تواصل معنا"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="minimal-line">
      <CorporateBusinessFloatingCta
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      </div>
    </div>
  );
}
