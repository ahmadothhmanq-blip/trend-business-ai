"use client";

import dynamic from "next/dynamic";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteHero } from "@/components/marketing/site/hero";
import { SiteCtaBand } from "@/components/marketing/site/ui";

const SiteSolutions = dynamic(
  () => import("@/components/marketing/site/solutions").then((m) => m.SiteSolutions),
  { loading: () => <section className="min-h-[320px]" aria-hidden /> },
);
const SiteFeaturedProducts = dynamic(
  () =>
    import("@/components/marketing/site/featured-products").then((m) => m.SiteFeaturedProducts),
  { loading: () => <section className="min-h-[320px]" aria-hidden /> },
);
const SiteWorkflow = dynamic(
  () => import("@/components/marketing/site/workflow").then((m) => m.SiteWorkflow),
  { loading: () => <section className="min-h-[280px]" aria-hidden /> },
);
const SiteWhy = dynamic(
  () => import("@/components/marketing/site/why").then((m) => m.SiteWhy),
  { loading: () => <section className="min-h-[280px]" aria-hidden /> },
);
const SiteTemplates = dynamic(
  () => import("@/components/marketing/site/templates").then((m) => m.SiteTemplates),
  { loading: () => <section className="min-h-[280px]" aria-hidden /> },
);
const SitePricing = dynamic(
  () => import("@/components/marketing/site/pricing").then((m) => m.SitePricing),
  { loading: () => <section className="min-h-[280px]" aria-hidden /> },
);
const SiteTestimonials = dynamic(
  () => import("@/components/marketing/site/testimonials").then((m) => m.SiteTestimonials),
  { loading: () => <section className="min-h-[240px]" aria-hidden /> },
);
const SiteFaq = dynamic(
  () => import("@/components/marketing/site/faq").then((m) => m.SiteFaq),
  { loading: () => <section className="min-h-[240px]" aria-hidden /> },
);

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
