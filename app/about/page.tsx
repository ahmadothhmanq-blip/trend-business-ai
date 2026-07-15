import type { Metadata } from "next";
import { MarketingAboutPage } from "@/components/marketing/marketing-about-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { createPageMetadata } from "@/lib/seo/metadata";
import { organizationJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = createPageMetadata({
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
      <MarketingAboutPage />
    </>
  );
}
