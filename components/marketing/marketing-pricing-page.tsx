"use client";

import { SiteShell } from "@/components/marketing/site/shell";
import { SiteStats } from "@/components/marketing/site/stats";
import { SitePricing } from "@/components/marketing/site/pricing";
import { SiteTrust } from "@/components/marketing/site/trust";
import { SiteCtaBand, SitePageHero } from "@/components/marketing/site/ui";

export function MarketingPricingPage({ children }: { children?: React.ReactNode }) {
  return (
    <SiteShell>
      <SitePageHero
        eyebrow="Pricing"
        title="Simple pricing for a premium AI platform."
        description="Start free during beta. Scale into higher limits and team workflows when you are ready."
        primary={{ label: "Start Free", href: "/signup" }}
        secondary={{ label: "Contact Sales", href: "/contact" }}
      />
      <SiteStats />
      <SitePricing standalone />
      <SiteTrust />
      {children}
      <SiteCtaBand
        title="Start building today"
        description="Create your free account and open every AI product category from one private dashboard."
        secondaryHref="/contact"
        secondaryLabel="Talk to Sales"
      />
    </SiteShell>
  );
}
