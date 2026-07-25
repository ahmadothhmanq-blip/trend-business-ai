import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedIndustries, industryPath } from "@/lib/seo/industries";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.clusters.industries.metaTitle"),
    description: t("marketing.publicPages.clusters.industries.metaDescription"),
    path: "/industries",
    type: "collection",
  });
}

export default async function IndustriesIndexPage() {
  const { t } = await getServerTranslator();
  const items = getPublishedIndustries().map((industry) => ({
    href: industryPath(industry.slug),
    title: industry.title,
    description: industry.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/industries"
      eyebrow={t("marketing.publicPages.clusters.industries.eyebrow")}
      title={t("marketing.publicPages.clusters.industries.title")}
      description={t("marketing.publicPages.clusters.industries.description")}
      items={items}
    />
  );
}
