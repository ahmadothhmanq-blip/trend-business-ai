import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Documentation & Help Center",
  description: PUBLIC_SAAS_PAGES.docs.description,
  path: "/docs",
});

export default function DocsPage() {
  return <PublicSaasPage page={PUBLIC_SAAS_PAGES.docs} />;
}

