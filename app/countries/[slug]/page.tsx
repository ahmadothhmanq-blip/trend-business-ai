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

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedCountries().map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country || country.status !== "published") return {};
  return SeoService.createMetadata({
    title: country.title,
    description: country.description,
    path: countryPath(country.slug),
    locale: "en",
  });
}

export default async function CountryPage({ params }: PageProps) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country || country.status !== "published") notFound();

  const path = countryPath(country.slug);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SeoBreadcrumbs items={breadcrumbsForUi(path)} />
        <JsonLdScript
          data={[
            breadcrumbJsonLd(buildBreadcrumbs(path)),
            webPageJsonLd({
              name: country.title,
              description: country.description,
              path,
            }),
          ]}
        />
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          Market · {country.code}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{country.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#A8A8A8]">{country.description}</p>
        <p className="mt-8 text-[15px] leading-relaxed text-[#C7C7C7]">
          Teams in {country.name} can use Trend Business AI to research opportunities, design brand
          systems, and ship websites and campaigns from a single AI business workspace.
        </p>
        <div className="mt-14">
          <RelatedLinksSection
            title="Explore the platform"
            links={getRelatedBusinessResources(4)}
          />
        </div>
      </div>
    </SiteShell>
  );
}
