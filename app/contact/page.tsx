import type { Metadata } from "next";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { LeadCaptureForm } from "@/components/marketing/growth/lead-capture-form";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.contact.metaTitle"),
    description: t("marketing.publicPages.contact.metaDescription"),
    path: "/contact",
  });
}

export default async function ContactPage() {
  const { t } = await getServerTranslator();

  return (
    <>
      <JsonLdScript
        id="contact-jsonld"
        data={webPageJsonLd({
          name: t("marketing.publicPages.contact.metaTitle"),
          description: t("marketing.publicPages.contact.metaDescription"),
          path: "/contact",
          type: "ContactPage",
        })}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.contact}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                {t("marketing.publicPages.contact.salesEyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {t("marketing.publicPages.contact.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#A8A8A8]">
                {t("marketing.publicPages.contact.description")}
              </p>
            </div>
            <LeadCaptureForm source="contact" className="rounded-3xl border border-[rgba(212,175,55,0.16)] bg-[#0B0B0B] p-6" />
          </div>
          <div className="mt-16">
            <RelatedLinksSection title={t("marketing.publicPages.contact.relatedResources")} links={SeoService.links.resources()} />
          </div>
        </div>
      </PublicSaasPage>
    </>
  );
}
