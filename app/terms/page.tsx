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
    title: t("marketing.publicPages.terms.metaTitle"),
    description: t("marketing.publicPages.terms.metaDescription"),
    path: "/terms",
  });
}

export default async function TermsPage() {
  const { t } = await getServerTranslator();

  const sections = [
    {
      title: t("marketing.publicPages.terms.sections.use.title"),
      body: t("marketing.publicPages.terms.sections.use.body"),
    },
    {
      title: t("marketing.publicPages.terms.sections.accounts.title"),
      body: t("marketing.publicPages.terms.sections.accounts.body"),
    },
    {
      title: t("marketing.publicPages.terms.sections.ai.title"),
      body: t("marketing.publicPages.terms.sections.ai.body"),
    },
    {
      title: t("marketing.publicPages.terms.sections.acceptable.title"),
      body: t("marketing.publicPages.terms.sections.acceptable.body"),
    },
    {
      title: t("marketing.publicPages.terms.sections.beta.title"),
      body: t("marketing.publicPages.terms.sections.beta.body"),
    },
    {
      title: t("marketing.publicPages.terms.sections.liability.title"),
      body: t("marketing.publicPages.terms.sections.liability.body"),
    },
  ] as const;

  return (
    <>
      <JsonLdScript
        id="terms-jsonld"
        data={webPageJsonLd({
          name: t("marketing.publicPages.terms.title"),
          description: t("marketing.publicPages.terms.metaDescription"),
          path: "/terms",
        })}
      />
      <MarketingLegalPage
        eyebrow={t("marketing.publicPages.terms.eyebrow")}
        title={t("marketing.publicPages.terms.title")}
        intro={t("marketing.publicPages.terms.intro")}
        sections={sections}
      >
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] pb-16">
          <RelatedLinksSection
            title={t("marketing.publicPages.terms.related")}
            links={[
              {
                title: t("marketing.publicPages.terms.privacyTitle"),
                description: t("marketing.publicPages.terms.privacyDescription"),
                href: "/privacy",
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
