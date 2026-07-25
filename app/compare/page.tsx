import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.clusters.compare.metaTitle"),
    description: t("marketing.publicPages.clusters.compare.metaDescription"),
    path: "/compare",
    type: "collection",
  });
}

export default async function CompareIndexPage() {
  const { t } = await getServerTranslator();
  const items = getPublishedProgrammaticPages("comparisons").map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/compare"
      eyebrow={t("marketing.publicPages.clusters.compare.eyebrow")}
      title={t("marketing.publicPages.clusters.compare.title")}
      description={t("marketing.publicPages.clusters.compare.description")}
      items={items}
    />
  );
}
