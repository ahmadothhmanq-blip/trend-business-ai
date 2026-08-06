import type { Metadata } from "next";
import { RealEstatePremiumDossierRail } from "@/components/real-estate-premium-dossier-rail";
import { RealEstatePremiumHero } from "@/components/real-estate-premium-hero";
import { RealEstatePremiumTestimonials } from "@/components/real-estate-premium-testimonials";
import { RealEstatePremiumArchitecture } from "@/components/real-estate-premium-architecture";
import { RealEstatePremiumInquiry } from "@/components/real-estate-premium-inquiry";
import { RealEstatePremiumNav } from "@/components/real-estate-premium-nav";
import { RealEstatePremiumFooter } from "@/components/real-estate-premium-footer";

export const metadata: Metadata = {
  title: "real-estate showcase",
  description: "Premium real-estate digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-real-estate-premium v2-layout-sidebar-left" data-v2-package="real-estate-premium" data-v2-composer="region-grid" data-v2-layout="full-bleed" data-v2-blueprint="bp-real-estate-premium-real-estate">
      <header data-v2-region="header">
      <RealEstatePremiumNav
        brandName={"real-estate showcase"}
        ctaLabel={"Inizia"}
        links={[{"href":"#collection","label":"Collection"},{"href":"#neighborhoods","label":"Neighborhoods"},{"href":"#advisors","label":"Advisors"},{"href":"#inquire","label":"Inquire"}]}
      />
      </header>
      <div className="v2-sidebar-shell mx-auto flex w-full max-w-[var(--container-max,82rem)] flex-col lg:flex-row">
        <h1 className="v2-sr-only">real-estate showcase</h1>
      <aside data-v2-region="sidebar" className="v2-sidebar-rail hidden shrink-0 lg:block lg:w-56 xl:w-64">
      <RealEstatePremiumDossierRail
        brandName={"real-estate showcase"}
        ctaLabel={"Inizia"}
        links={[{"href":"#collection","label":"Collection"},{"href":"#neighborhoods","label":"Neighborhoods"},{"href":"#advisors","label":"Advisors"},{"href":"#inquire","label":"Inquire"}]}
      />
      </aside>
      <main data-v2-region="main" className="v2-main-canvas min-w-0 flex-1">
      <div data-v2-section="hero" data-v2-variant="immersive-visual">
      <RealEstatePremiumHero
        subtitle={"Premium real-estate digital experience"}
        primaryCta={"Inizia"}
        secondaryCta={"Scopri di più"}
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="featured-quote">
      <RealEstatePremiumTestimonials
      />
      </div>
      <div data-v2-section="services" data-v2-variant="tabbed-list">
      <RealEstatePremiumArchitecture
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="dark-panel">
      <RealEstatePremiumInquiry
        ctaLabel={"Inizia"}
      />
      </div>
      </main>
      </div>

      <footer data-v2-region="footer">
      <RealEstatePremiumFooter
        brandName={"real-estate showcase"}
        links={[{"href":"#collection","label":"Collection"},{"href":"#neighborhoods","label":"Neighborhoods"},{"href":"#advisors","label":"Advisors"},{"href":"#inquire","label":"Inquire"}]}
      />
      </footer>

    </div>
  );
}
