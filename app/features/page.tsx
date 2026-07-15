import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Features",
  description: PUBLIC_SAAS_PAGES.features.description,
  path: "/features",
  type: "collection",
});

export default function FeaturesPage() {
  return (
    <>
      <JsonLdScript
        id="features-jsonld"
        data={[
          webPageJsonLd({
            name: "Features",
            description: PUBLIC_SAAS_PAGES.features.description,
            path: "/features",
            type: "CollectionPage",
          }),
          collectionPageJsonLd({
            name: "Trend Business AI Features",
            description: PUBLIC_SAAS_PAGES.features.description,
            path: "/features",
            items: PUBLIC_SAAS_PAGES.features.sections.map((section) => ({
              name: section.title,
              path: "/features",
              description: section.description,
            })),
          }),
        ]}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.features}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title="Explore products"
            links={[
              ...SeoService.links.services("create"),
              ...SeoService.links.resources(2),
            ]}
          />
        </div>
      </PublicSaasPage>
    </>
  );
}
