import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Changelog",
  description: PUBLIC_SAAS_PAGES.changelog.description,
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <>
      <JsonLdScript
        id="changelog-jsonld"
        data={webPageJsonLd({
          name: "Changelog",
          description: PUBLIC_SAAS_PAGES.changelog.description,
          path: "/changelog",
        })}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.changelog}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title="Stay up to date"
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
