import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { SeoService } from "@/lib/seo/engine";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.privacy.metaTitle"),
    description: t("marketing.publicPages.privacy.metaDescription"),
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const { t } = await getServerTranslator();

  const sections = [
    {
      title: t("marketing.publicPages.privacy.sections.collect.title"),
      body: t("marketing.publicPages.privacy.sections.collect.body"),
    },
    {
      title: t("marketing.publicPages.privacy.sections.use.title"),
      body: t("marketing.publicPages.privacy.sections.use.body"),
    },
    {
      title: t("marketing.publicPages.privacy.sections.ai.title"),
      body: t("marketing.publicPages.privacy.sections.ai.body"),
    },
    {
      title: t("marketing.publicPages.privacy.sections.storage.title"),
      body: t("marketing.publicPages.privacy.sections.storage.body"),
    },
    {
      title: t("marketing.publicPages.privacy.sections.choices.title"),
      body: t("marketing.publicPages.privacy.sections.choices.body"),
    },
    {
      title: t("marketing.publicPages.privacy.sections.beta.title"),
      body: t("marketing.publicPages.privacy.sections.beta.body"),
    },
  ] as const;

  return (
    <>
      <JsonLdScript
        id="privacy-jsonld"
        data={webPageJsonLd({
          name: t("marketing.publicPages.privacy.title"),
          description: t("marketing.publicPages.privacy.metaDescription"),
          path: "/privacy",
        })}
      />
      <MarketingLegalPage
        eyebrow={t("marketing.publicPages.privacy.eyebrow")}
        title={t("marketing.publicPages.privacy.title")}
        intro={t("marketing.publicPages.privacy.intro")}
        sections={sections}
      >
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] pb-16">
          <RelatedLinksSection
            title={t("marketing.publicPages.privacy.related")}
            links={[
              {
                title: t("marketing.publicPages.privacy.termsTitle"),
                description: t("marketing.publicPages.privacy.termsDescription"),
                href: "/terms",
                kind: "resource",
              },
              ...SeoService.links.resources(2),
            ]}
          />
        </div>
      </MarketingLegalPage>
    </>
  );
}
