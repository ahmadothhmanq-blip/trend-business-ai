import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.clusters.services.metaTitle"),
    description: t("marketing.publicPages.clusters.services.metaDescription"),
    path: "/services",
    type: "collection",
  });
}

export default async function ServicesIndexPage() {
  const { t } = await getServerTranslator();
  const items = getPublishedProgrammaticPages("services").map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/services"
      eyebrow={t("marketing.publicPages.clusters.services.eyebrow")}
      title={t("marketing.publicPages.clusters.services.title")}
      description={t("marketing.publicPages.clusters.services.description")}
      items={items}
    />
  );
}
