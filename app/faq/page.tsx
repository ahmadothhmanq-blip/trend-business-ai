import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { REF_FAQ } from "@/lib/constants/marketing-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ",
  description: PUBLIC_SAAS_PAGES.faq.description,
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLdScript
        id="faq-jsonld"
        data={[
          webPageJsonLd({
            name: "FAQ",
            description: PUBLIC_SAAS_PAGES.faq.description,
            path: "/faq",
            type: "FAQPage",
          }),
          faqPageJsonLd(
            REF_FAQ.map((item) => ({ question: item.question, answer: item.answer })),
          ),
        ]}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.faq} />
    </>
  );
}
