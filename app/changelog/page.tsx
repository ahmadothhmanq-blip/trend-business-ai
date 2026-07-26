import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.changelog.metaTitle"),
    description: PUBLIC_SAAS_PAGES.changelog.description,
    path: "/changelog",
  });
}

export default async function ChangelogPage() {
  const { t } = await getServerTranslator();

  return (
    <>
      <JsonLdScript
        id="changelog-jsonld"
        data={webPageJsonLd({
          name: t("marketing.publicPages.changelog.jsonLdName"),
          description: PUBLIC_SAAS_PAGES.changelog.description,
          path: "/changelog",
        })}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.changelog}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title={t("marketing.publicPages.changelog.stayUpToDate")}
            links={[
              ...SeoService.links.articles(),
              ...SeoService.links.resources(2),
            ]}
          />
        </div>
      </PublicSaasPage>
    </>
  );
}
