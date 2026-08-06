import type { Metadata } from "next";
import { MedicalPremiumAppointmentBand } from "@/components/medical-premium-appointment-band";
import { MedicalPremiumTrustHero } from "@/components/medical-premium-trust-hero";
import { MedicalPremiumPhysicians } from "@/components/medical-premium-physicians";
import { MedicalPremiumTestimonials } from "@/components/medical-premium-testimonials";
import { MedicalPremiumCareJourney } from "@/components/medical-premium-care-journey";
import { MedicalPremiumWellness } from "@/components/medical-premium-wellness";
import { MedicalPremiumContact } from "@/components/medical-premium-contact";
import { MedicalPremiumNav } from "@/components/medical-premium-nav";
import { MedicalPremiumFooter } from "@/components/medical-premium-footer";

export const metadata: Metadata = {
  title: "medical showcase",
  description: "Premium medical digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-medical-premium v2-layout-full-bleed" data-v2-package="medical-premium" data-v2-composer="region-grid" data-v2-layout="full-bleed" data-v2-blueprint="bp-medical-premium-medical">
      <header data-v2-region="header">
      <MedicalPremiumNav
        brandName={"medical showcase"}
        ctaLabel={"ابدأ الآن"}
        links={[{"href":"#specialties","label":"Specialties"},{"href":"#physicians","label":"Physicians"},{"href":"#care","label":"Care journey"},{"href":"#appointments","label":"Appointments"}]}
      />
      </header>
      <div data-v2-region="overlay" className="v2-overlay-canvas">
      <div data-v2-section="cta" data-v2-variant="centered-band">
      <MedicalPremiumAppointmentBand
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      </div>

      <main data-v2-region="main" className="v2-main-canvas flex flex-col">
        <h1 className="v2-sr-only">medical showcase</h1>
      <div data-v2-section="hero" data-v2-variant="split-trust">
      <MedicalPremiumTrustHero
        subtitle={"Premium medical digital experience"}
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      <div data-v2-section="about" data-v2-variant="timeline-story">
      <MedicalPremiumPhysicians
        primaryCta={"ابدأ الآن"}
        secondaryCta={"اعرف المزيد"}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="logo-wall">
      <MedicalPremiumTestimonials
      />
      </div>
      <div data-v2-section="services" data-v2-variant="minimal-list">
      <MedicalPremiumCareJourney
      />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <MedicalPremiumWellness
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="stacked-inline">
      <MedicalPremiumContact
        ctaLabel={"ابدأ الآن"}
      />
      </div>
      </main>
      <footer data-v2-region="footer">
      <MedicalPremiumFooter
        brandName={"medical showcase"}
        links={[{"href":"#specialties","label":"Specialties"},{"href":"#physicians","label":"Physicians"},{"href":"#care","label":"Care journey"},{"href":"#appointments","label":"Appointments"}]}
      />
      </footer>
    </div>
  );
}
