"use client";

import { SiteShell } from "@/components/marketing/site/shell";
import { SiteStats } from "@/components/marketing/site/stats";
import { SitePricing } from "@/components/marketing/site/pricing";
import { SiteTrust } from "@/components/marketing/site/trust";
import { SiteCtaBand, SitePageHero } from "@/components/marketing/site/ui";
import { useScopedT } from "@/lib/i18n/use-scoped-t";

export function MarketingPricingPage({ children }: { children?: React.ReactNode }) {
  const tPricing = useScopedT("marketing.pricing");
  const tCta = useScopedT("marketing.cta");
  const tCommon = useScopedT("marketing.common");

  return (
    <SiteShell>
      <SitePageHero
        eyebrow={tPricing("label")}
        title={tPricing("title")}
        description={tPricing("description")}
        primary={{ label: tCommon("startFree"), href: "/signup" }}
        secondary={{ label: tCommon("contactSales"), href: "/contact" }}
      />
      <SiteStats />
      <SitePricing standalone />
      <SiteTrust />
      {children}
      <SiteCtaBand
        title={tCta("startBuildingToday")}
        description={tCta("startBuildingTodayDescription")}
        secondaryHref="/contact"
        secondaryLabel={tCommon("talkToSales")}
      />
    </SiteShell>
  );
}
