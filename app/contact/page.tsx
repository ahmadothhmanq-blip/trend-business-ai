import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Contact",
  description: PUBLIC_SAAS_PAGES.contact.description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLdScript
        id="contact-jsonld"
        data={webPageJsonLd({
          name: "Contact",
          description: PUBLIC_SAAS_PAGES.contact.description,
          path: "/contact",
          type: "ContactPage",
        })}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.contact}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection title="Helpful resources" links={SeoService.links.resources()} />
        </div>
      </PublicSaasPage>
    </>
  );
}
