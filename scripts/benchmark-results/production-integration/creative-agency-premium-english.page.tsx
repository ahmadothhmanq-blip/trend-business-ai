import type { Metadata } from "next";
import { CreativeAgencyPremiumHero } from "@/components/creative-agency-premium-hero";
import { CreativeAgencyPremiumSelectedWork } from "@/components/creative-agency-premium-selected-work";
import { CreativeAgencyPremiumManifesto } from "@/components/creative-agency-premium-manifesto";
import { CreativeAgencyPremiumCollaborateCta } from "@/components/creative-agency-premium-collaborate-cta";
import { CreativeAgencyPremiumNav } from "@/components/creative-agency-premium-nav";
import { CreativeAgencyPremiumFooter } from "@/components/creative-agency-premium-footer";

export const metadata: Metadata = {
  title: "creative-agency showcase",
  description: "Premium creative-agency digital experience",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-creative-agency-premium v2-layout-editorial-reveal" data-v2-package="creative-agency-premium" data-v2-composer="region-grid" data-v2-layout="editorial-reveal" data-v2-blueprint="bp-creative-agency-premium-creative-agency">
      <header data-v2-region="header">
      <CreativeAgencyPremiumNav
        brandName={"creative-agency showcase"}
        ctaLabel={"Start a project"}
        links={[{"href":"#work","label":"Work"},{"href":"#studio","label":"Studio"},{"href":"#process","label":"Process"},{"href":"#contact","label":"Contact"}]}
      />
      </header>
      <main data-v2-region="main" className="v2-main-canvas flex flex-col">
        <h1 className="v2-sr-only">creative-agency showcase</h1>
      <div data-v2-section="hero" data-v2-variant="split-trust">
      <CreativeAgencyPremiumHero
        primaryCta={"Start a project"}
        secondaryCta={"View work"}
      />
      </div>
      <div data-v2-section="portfolio" data-v2-variant="masonry-grid">
      <CreativeAgencyPremiumSelectedWork
      />
      </div>
      <div data-v2-section="about" data-v2-variant="overlap-portrait">
      <CreativeAgencyPremiumManifesto
      />
      </div>
      </main>
      <div data-v2-region="overlay" className="v2-overlay-reveal">
      <div data-v2-section="cta" data-v2-variant="gradient-banner">
      <CreativeAgencyPremiumCollaborateCta
      />
      </div>
      </div>
      <footer data-v2-region="footer">
      <CreativeAgencyPremiumFooter
        brandName={"creative-agency showcase"}
        links={[{"href":"#work","label":"Work"},{"href":"#studio","label":"Studio"},{"href":"#process","label":"Process"},{"href":"#contact","label":"Contact"}]}
      />
      </footer>
    </div>
  );
}
