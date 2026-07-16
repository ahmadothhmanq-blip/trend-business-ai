import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { LeadCaptureForm } from "@/components/marketing/growth/lead-capture-form";
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
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                Contact sales
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Tell us what you are building
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#A8A8A8]">
                Share your goals and we will route you to the right product workflow, partnership
                conversation, or onboarding path.
              </p>
            </div>
            <LeadCaptureForm source="contact" className="rounded-3xl border border-[rgba(212,175,55,0.16)] bg-[#0B0B0B] p-6" />
          </div>
          <div className="mt-16">
            <RelatedLinksSection title="Helpful resources" links={SeoService.links.resources()} />
          </div>
        </div>
      </PublicSaasPage>
    </>
  );
}
