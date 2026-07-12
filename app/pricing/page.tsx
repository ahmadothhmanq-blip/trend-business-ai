import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing",
  description: PUBLIC_SAAS_PAGES.pricing.description,
  path: "/pricing",
});

export default function PricingPage() {
  return <PublicSaasPage page={PUBLIC_SAAS_PAGES.pricing} />;
}
