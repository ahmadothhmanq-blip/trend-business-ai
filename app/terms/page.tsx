import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { SeoService } from "@/lib/seo/engine";
import { webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Terms of Service",
  description: "Terms for using the Trend Business AI MVP beta.",
  path: "/terms",
});

const sections = [
  {
    title: "Use of the Service",
    body: "Trend Business AI is provided as an MVP beta for business planning, research, reporting, and website blueprint generation. You are responsible for how you use generated outputs and for validating information before making business decisions.",
  },
  {
    title: "Accounts",
    body: "You must provide accurate account information and keep your login credentials secure. Activity performed through your account is your responsibility.",
  },
  {
    title: "AI Outputs",
    body: "AI-generated content may be incomplete, inaccurate, or unsuitable for your specific situation. Outputs are provided for planning assistance and should not be treated as legal, financial, tax, or professional advice.",
  },
  {
    title: "Acceptable Use",
    body: "Do not use the service to submit unlawful, harmful, confidential, regulated, or sensitive personal information. Do not attempt to bypass authentication, rate limits, or security controls.",
  },
  {
    title: "Beta Availability",
    body: "Features, limits, pricing, and availability may change as the product evolves from MVP beta toward production.",
  },
  {
    title: "Limitation of Liability",
    body: "The MVP is provided as-is. To the maximum extent permitted by law, Trend Business AI is not liable for losses resulting from reliance on generated content or service interruptions.",
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <JsonLdScript
        id="terms-jsonld"
        data={webPageJsonLd({
          name: "Terms of Service",
          description: "Terms for using the Trend Business AI MVP beta.",
          path: "/terms",
        })}
      />
      <MarketingLegalPage
        eyebrow="Legal"
        title="Terms of Service"
        intro="Last updated: July 5, 2026. These terms describe the current MVP beta usage expectations for Trend Business AI."
        sections={sections}
      >
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] pb-16">
          <RelatedLinksSection
            title="Related"
            links={[
              {
                title: "Privacy Policy",
                description: "How we handle account and generated data.",
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
