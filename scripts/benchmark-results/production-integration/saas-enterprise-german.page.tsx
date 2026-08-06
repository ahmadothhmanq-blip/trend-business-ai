import type { Metadata } from "next";
import { SaasEnterpriseHero } from "@/components/saas-enterprise-hero";
import { SaasEnterpriseFeatures } from "@/components/saas-enterprise-features";
import { SaasEnterprisePricing } from "@/components/saas-enterprise-pricing";
import { SaasEnterpriseTestimonials } from "@/components/saas-enterprise-testimonials";
import { SaasEnterpriseAbout } from "@/components/saas-enterprise-about";
import { SaasEnterpriseContact } from "@/components/saas-enterprise-contact";
import { SaasEnterpriseIntegrations } from "@/components/saas-enterprise-integrations";
import { SaasEnterpriseFloatingCta } from "@/components/saas-enterprise-floating-cta";
import { SaasEnterpriseNav } from "@/components/saas-enterprise-nav";
import { SaasEnterpriseFooter } from "@/components/saas-enterprise-footer";

export const metadata: Metadata = {
  title: "saas showcase",
  description: "Premium saas digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-saas-enterprise" data-v2-package="saas-enterprise" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-saas-enterprise-saas">
      <header data-v2-region="header">
      <SaasEnterpriseNav
        brandName={"saas showcase"}
        ctaLabel={"Jetzt starten"}
        links={[{"href":"#features","label":"Funktionen"},{"href":"#platform","label":"Leistungen"},{"href":"#pricing","label":"Preise"},{"href":"#contact","label":"Kontakt"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only">saas showcase</h1>
      <div data-v2-section="hero" data-v2-variant="metrics-rail">
      <SaasEnterpriseHero
        subtitle={"Premium saas digital experience"}
        primaryCta={"Jetzt starten"}
        secondaryCta={"Mehr erfahren"}
      />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <SaasEnterpriseFeatures
      />
      </div>
      <div data-v2-section="pricing" data-v2-variant="comparison-table">
      <SaasEnterprisePricing
      />
      </div>
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <SaasEnterpriseTestimonials
      />
      </div>
      <div data-v2-section="about" data-v2-variant="split-narrative">
      <SaasEnterpriseAbout
      />
      </div>
      <div data-v2-section="contact" data-v2-variant="cards-grid">
      <SaasEnterpriseContact
        ctaLabel={"Jetzt starten"}
      />
      </div>
      <SaasEnterpriseIntegrations
        primaryCta={"Jetzt starten"}
        secondaryCta={"Mehr erfahren"}
      />
      </main>

      <footer data-v2-region="footer">
      <SaasEnterpriseFooter
        brandName={"saas showcase"}
        links={[{"href":"#features","label":"Funktionen"},{"href":"#platform","label":"Leistungen"},{"href":"#pricing","label":"Preise"},{"href":"#contact","label":"Kontakt"}]}
      />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div data-v2-section="cta" data-v2-variant="floating-card">
      <SaasEnterpriseFloatingCta
        primaryCta={"Jetzt starten"}
        secondaryCta={"Mehr erfahren"}
      />
      </div>
      </div>
    </div>
  );
}
