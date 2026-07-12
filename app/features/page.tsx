import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Features",
  description: PUBLIC_SAAS_PAGES.features.description,
  path: "/features",
});

export default function FeaturesPage() {
  return <PublicSaasPage page={PUBLIC_SAAS_PAGES.features} />;
}

