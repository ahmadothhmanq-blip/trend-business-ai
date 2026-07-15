import type { Metadata } from "next";
import { MarketingPricingPage } from "@/components/marketing/marketing-pricing-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SeoService } from "@/lib/seo/engine";
import { softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Pricing",
  description:
    "Simple pricing for Trend Business AI. Start free during beta and scale into higher limits when you are ready.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <JsonLdScript
        id="pricing-jsonld"
        data={[
          webPageJsonLd({
            name: "Pricing",
            description:
              "Simple pricing for Trend Business AI. Start free during beta and scale into higher limits when you are ready.",
            path: "/pricing",
          }),
          softwareApplicationJsonLd({
            name: SeoService.siteName,
            description: SeoService.defaultDescription,
            offersPrice: "0",
          }),
        ]}
      />
      <MarketingPricingPage />
    </>
  );
}
