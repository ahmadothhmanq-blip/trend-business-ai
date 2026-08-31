import type { Metadata } from "next";
import { SaasEnterpriseHero } from "@/components/saas-enterprise-hero";
import { SaasEnterpriseFeatures } from "@/components/saas-enterprise-features";
import { SaasEnterpriseIntegrations } from "@/components/saas-enterprise-integrations";
import { SaasEnterpriseAbout } from "@/components/saas-enterprise-about";
import { SaasEnterpriseStats } from "@/components/saas-enterprise-stats";
import { SaasEnterprisePortfolio } from "@/components/saas-enterprise-portfolio";
import { SaasEnterpriseTestimonials } from "@/components/saas-enterprise-testimonials";
import { SaasEnterprisePricing } from "@/components/saas-enterprise-pricing";
import { SaasEnterpriseFaq } from "@/components/saas-enterprise-faq";
import { SaasEnterpriseContact } from "@/components/saas-enterprise-contact";
import { SaasEnterpriseUtilityBand } from "@/components/saas-enterprise-utility-band";
import { SaasEnterpriseNav } from "@/components/saas-enterprise-nav";
import { SaasEnterpriseFooter } from "@/components/saas-enterprise-footer";

export const metadata: Metadata = {
  title: "Preview Probe",
  description: "Live preview error capture",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-saas-enterprise" data-v2-package="saas-enterprise" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-saas-enterprise-general">
      <header data-v2-region="header">
      <SaasEnterpriseNav />
      </header>
      <main id="main-content" data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only text-4xl">Preview Probe</h1>
      <div data-v2-section="hero" data-v2-variant="metrics-rail">
      <SaasEnterpriseHero />
      </div>
      <div data-v2-section="features" data-v2-variant="bento-mosaic">
      <SaasEnterpriseFeatures />
      </div>
      <SaasEnterpriseIntegrations />
      <div data-v2-section="about" data-v2-variant="overlap-portrait">
      <SaasEnterpriseAbout />
      </div>
      <SaasEnterpriseStats />
      <SaasEnterprisePortfolio />
      <div data-v2-section="testimonials" data-v2-variant="logo-wall">
      <SaasEnterpriseTestimonials />
      </div>
      <div data-v2-section="pricing" data-v2-variant="comparison-table">
      <SaasEnterprisePricing />
      </div>
      <SaasEnterpriseFaq />
      <div data-v2-section="contact" data-v2-variant="map-sidebar">
      <SaasEnterpriseContact />
      </div>
      </main>
      <utility data-v2-region="utility">
      <SaasEnterpriseUtilityBand />
      </utility>
      <footer data-v2-region="footer">
      <SaasEnterpriseFooter />
      </footer>

    </div>
  );
}
