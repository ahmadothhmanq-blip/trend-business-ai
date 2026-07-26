import type { Metadata } from "next";
import { MarketingPricingPage } from "@/components/marketing/marketing-pricing-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { SeoService } from "@/lib/seo/engine";
import { softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.pricing.metaTitle"),
    description: t("marketing.publicPages.pricing.metaDescription"),
    path: "/pricing",
  });
}

export default async function PricingPage() {
  const { t } = await getServerTranslator();
  const description = t("marketing.publicPages.pricing.metaDescription");

  return (
    <>
      <JsonLdScript
        id="pricing-jsonld"
        data={[
          webPageJsonLd({
            name: t("marketing.publicPages.pricing.jsonLdName"),
            description,
            path: "/pricing",
          }),
          softwareApplicationJsonLd({
            name: SeoService.siteName,
            description: SeoService.defaultDescription,
            offersPrice: "0",
          }),
        ]}
      />
      <MarketingPricingPage>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title={t("marketing.publicPages.pricing.beforeUpgrade")}
            links={[
              ...SeoService.links.tools("website-builder", 2),
              ...SeoService.links.resources(2),
            ]}
          />
        </div>
      </MarketingPricingPage>
    </>
  );
}
