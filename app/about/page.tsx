import type { Metadata } from "next";
import { MarketingAboutPage } from "@/components/marketing/marketing-about-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { SeoService } from "@/lib/seo/engine";
import { organizationJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.about.metaTitle"),
    description: t("marketing.publicPages.about.metaDescription"),
    path: "/about",
  });
}

export default async function AboutPage() {
  const { t } = await getServerTranslator();

  return (
    <>
      <JsonLdScript
        id="about-jsonld"
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: t("marketing.publicPages.about.jsonLdName"),
            description: t("marketing.publicPages.about.metaDescription"),
            path: "/about",
            type: "AboutPage",
          }),
        ]}
      />
      <MarketingAboutPage>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title={t("marketing.publicPages.about.explorePlatform")}
            links={[
              ...SeoService.links.services("business"),
              ...SeoService.links.resources(2),
            ]}
          />
        </div>
      </MarketingAboutPage>
    </>
  );
}
