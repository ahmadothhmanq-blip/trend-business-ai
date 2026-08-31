import type { Metadata } from "next";
import { AiStartupSignalHero } from "@/components/ai-startup-signal-hero";
import { AiStartupSignalFeatures } from "@/components/ai-startup-signal-features";
import { AiStartupSignalIntegrations } from "@/components/ai-startup-signal-integrations";
import { AiStartupSignalAbout } from "@/components/ai-startup-signal-about";
import { AiStartupSignalStats } from "@/components/ai-startup-signal-stats";
import { AiStartupSignalTestimonials } from "@/components/ai-startup-signal-testimonials";
import { AiStartupSignalPortfolio } from "@/components/ai-startup-signal-portfolio";
import { AiStartupSignalPricing } from "@/components/ai-startup-signal-pricing";
import { AiStartupSignalFaq } from "@/components/ai-startup-signal-faq";
import { AiStartupSignalContact } from "@/components/ai-startup-signal-contact";
import { AiStartupSignalUtilityBand } from "@/components/ai-startup-signal-utility-band";
import { AiStartupSignalFloatingCta } from "@/components/ai-startup-signal-floating-cta";
import { AiStartupSignalNav } from "@/components/ai-startup-signal-nav";
import { AiStartupSignalFooter } from "@/components/ai-startup-signal-footer";

export const metadata: Metadata = {
  title: "Preview Probe",
  description: "Live preview error capture",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-ai-startup-signal" data-v2-package="ai-startup-signal" data-v2-composer="region-grid" data-v2-layout="default" data-v2-blueprint="bp-ai-startup-signal-general">
      <header data-v2-region="header">
      <AiStartupSignalNav />
      </header>
      <main id="main-content" data-v2-region="main" className="v2-region-grid flex flex-col">
        <h1 className="v2-sr-only text-4xl">Preview Probe</h1>
      <div data-v2-section="hero" data-v2-variant="split-trust">
      <AiStartupSignalHero />
      </div>
      <div data-v2-section="features" data-v2-variant="spotlight-list">
      <AiStartupSignalFeatures />
      </div>
      <AiStartupSignalIntegrations />
      <div data-v2-section="services" data-v2-variant="process-rail">
      <AiStartupSignalAbout />
      </div>
      <AiStartupSignalStats />
      <div data-v2-section="testimonials" data-v2-variant="minimal-list">
      <AiStartupSignalTestimonials />
      </div>
      <AiStartupSignalPortfolio />
      <AiStartupSignalPricing />
      <AiStartupSignalFaq />
      <div data-v2-section="contact" data-v2-variant="cards-grid">
      <AiStartupSignalContact />
      </div>
      </main>
      <utility data-v2-region="utility">
      <AiStartupSignalUtilityBand />
      </utility>
      <footer data-v2-region="footer">
      <AiStartupSignalFooter />
      </footer>
      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <AiStartupSignalFloatingCta />
      </div>
    </div>
  );
}
