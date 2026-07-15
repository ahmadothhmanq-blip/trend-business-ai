import type { Metadata } from "next";
import { MarketingAboutPage } from "@/components/marketing/marketing-about-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { SeoService } from "@/lib/seo/engine";
import { organizationJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "About",
  description:
    "Trend Business AI is a next-generation AI platform to build, automate and scale websites, apps, content, marketing and business intelligence.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLdScript
        id="about-jsonld"
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: "About Trend Business AI",
            description:
              "Trend Business AI is a next-generation AI platform to build, automate and scale websites, apps, content, marketing and business intelligence.",
            path: "/about",
            type: "AboutPage",
          }),
        ]}
      />
      <MarketingAboutPage>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title="Explore the platform"
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
