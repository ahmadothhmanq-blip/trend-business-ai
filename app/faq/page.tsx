import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { REF_FAQ } from "@/lib/constants/marketing-content";
import { SeoService } from "@/lib/seo/engine";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.faq.label"),
    description: PUBLIC_SAAS_PAGES.faq.description,
    path: "/faq",
  });
}

export default async function FaqPage() {
  const { t } = await getServerTranslator();

  return (
    <>
      <JsonLdScript
        id="faq-jsonld"
        data={[
          webPageJsonLd({
            name: t("marketing.faq.label"),
            description: PUBLIC_SAAS_PAGES.faq.description,
            path: "/faq",
            type: "FAQPage",
          }),
          faqPageJsonLd(
            REF_FAQ.map((item) => ({ question: item.question, answer: item.answer })),
          ),
        ]}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.faq}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title={t("marketing.publicPages.faqPage.relatedResources")}
            links={[
              ...SeoService.links.articles(),
              ...SeoService.links.resources(3),
            ]}
          />
        </div>
      </PublicSaasPage>
    </>
  );
}
