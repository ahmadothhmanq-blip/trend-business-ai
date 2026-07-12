import type { Metadata } from "next";
import { MarketingPricingPage } from "@/components/marketing/marketing-pricing-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description:
    "Simple pricing for Trend Business AI. Start free during beta and scale into higher limits when you are ready.",
  path: "/pricing",
});

export default function PricingPage() {
  return <MarketingPricingPage />;
}
