"use client";

import { SiteShell } from "@/components/marketing/site/shell";
import { SiteHero } from "@/components/marketing/site/hero";
import { SiteSolutions } from "@/components/marketing/site/solutions";
import { SiteFeaturedProducts } from "@/components/marketing/site/featured-products";
import { SiteWorkflow } from "@/components/marketing/site/workflow";
import { SiteWhy } from "@/components/marketing/site/why";
import { SiteTemplates } from "@/components/marketing/site/templates";
import { SitePricing } from "@/components/marketing/site/pricing";
import { SiteTestimonials } from "@/components/marketing/site/testimonials";
import { SiteFaq } from "@/components/marketing/site/faq";
import { SiteCtaBand } from "@/components/marketing/site/ui";

export function MarketingPage() {
  return (
    <SiteShell>
      <SiteHero />
      <SiteSolutions />
      <SiteFeaturedProducts />
      <SiteWorkflow />
      <SiteWhy />
      <SiteTemplates />
      <SitePricing />
      <SiteTestimonials />
      <SiteFaq />
      <SiteCtaBand
        title="Ready to build with Trend Business AI?"
        description="Create your free account and explore Create, Design, Content, and Business products from one premium AI workspace."
        secondaryHref="/#solutions"
        secondaryLabel="Browse AI Solutions"
      />
    </SiteShell>
  );
}
