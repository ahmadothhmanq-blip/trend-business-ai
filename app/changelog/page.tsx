import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Changelog",
  description: PUBLIC_SAAS_PAGES.changelog.description,
  path: "/changelog",
});

export default function ChangelogPage() {
  return <PublicSaasPage page={PUBLIC_SAAS_PAGES.changelog} />;
}

