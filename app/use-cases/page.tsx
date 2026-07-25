import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return SeoService.createMetadata({
    title: t("marketing.publicPages.clusters.useCases.metaTitle"),
    description: t("marketing.publicPages.clusters.useCases.metaDescription"),
    path: "/use-cases",
    type: "collection",
  });
}

export default async function UseCasesIndexPage() {
  const { t } = await getServerTranslator();
  const items = getPublishedProgrammaticPages("use-cases").map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/use-cases"
      eyebrow={t("marketing.publicPages.clusters.useCases.eyebrow")}
      title={t("marketing.publicPages.clusters.useCases.title")}
      description={t("marketing.publicPages.clusters.useCases.description")}
      items={items}
    />
  );
}
