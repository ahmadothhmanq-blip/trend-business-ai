import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedCountries, countryPath } from "@/lib/seo/countries";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.clusters.countries.metaTitle"),
    description: t("marketing.publicPages.clusters.countries.metaDescription"),
    path: "/countries",
    type: "collection",
  });
}

export default async function CountriesIndexPage() {
  const { t } = await getServerTranslator();
  const items = getPublishedCountries().map((country) => ({
    href: countryPath(country.slug),
    title: country.title,
    description: country.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/countries"
      eyebrow={t("marketing.publicPages.clusters.countries.eyebrow")}
      title={t("marketing.publicPages.clusters.countries.title")}
      description={t("marketing.publicPages.clusters.countries.description")}
      items={items}
    />
  );
}
