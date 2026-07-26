import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/marketing/site/shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SeoBreadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { breadcrumbsForUi, buildBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { SeoService } from "@/lib/seo/engine";
import {
  countryPath,
  getCountryBySlug,
  getPublishedCountries,
} from "@/lib/seo/countries";
import { getRelatedBusinessResources } from "@/lib/seo/internal-links";
import { getServerTranslator } from "@/lib/i18n/server";
import { getLocalizedCountry } from "@/lib/seo/localized-content";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedCountries().map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country || country.status !== "published") return {};
  const { locale } = await getServerTranslator();
  const localized = getLocalizedCountry(locale, country);
  return SeoService.createMetadata({
    title: localized.title,
    description: localized.description,
    path: countryPath(country.slug),
    locale,
  });
}

export default async function CountryPage({ params }: PageProps) {
  const { slug } = await params;
  const { t, locale } = await getServerTranslator();
  const country = getCountryBySlug(slug);
  if (!country || country.status !== "published") notFound();
  const localized = getLocalizedCountry(locale, country);

  const path = countryPath(country.slug);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SeoBreadcrumbs items={breadcrumbsForUi(path)} />
        <JsonLdScript
          data={[
            breadcrumbJsonLd(buildBreadcrumbs(path)),
            webPageJsonLd({
              name: localized.title,
              description: localized.description,
              path,
            }),
          ]}
        />
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          {t("marketing.publicPages.countryPage.marketEyebrow", { code: country.code })}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{localized.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#A8A8A8]">{localized.description}</p>
        <p className="mt-8 text-[15px] leading-relaxed text-[#C7C7C7]">
          {t("marketing.publicPages.countryPage.body", { name: localized.name })}
        </p>
        <div className="mt-14">
          <RelatedLinksSection
            title={t("marketing.publicPages.countryPage.explorePlatform")}
            links={getRelatedBusinessResources(4)}
          />
        </div>
      </div>
    </SiteShell>
  );
}
