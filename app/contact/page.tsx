import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: PUBLIC_SAAS_PAGES.contact.description,
  path: "/contact",
});

export default function ContactPage() {
  return <PublicSaasPage page={PUBLIC_SAAS_PAGES.contact} />;
}

