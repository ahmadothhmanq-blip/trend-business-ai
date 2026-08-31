import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

export type OgShareMeta = {
  title: string;
  description: string;
  imageUrl?: string;
  siteName: string;
  twitterCard: "summary_large_image";
};

export function buildOgShareMeta(project: GeneratedWebsiteProject): OgShareMeta {
  const title =
    project.seoPackage?.metadata?.title?.trim() ||
    project.title ||
    "Website";
  const description =
    project.seoPackage?.metadata?.description?.trim() ||
    project.description ||
    "";
  const hero = project.assetManifest?.items?.find((a) => a.role === "hero");

  return {
    title,
    description,
    imageUrl: hero?.url ?? undefined,
    siteName: project.title || "Trend Business AI",
    twitterCard: "summary_large_image",
  };
}

export function buildShareUrl(publicSlug: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/s/${publicSlug}`;
}

/** AEO-friendly FAQ block suggestion from site sections */
export function suggestAeoFaqTopics(project: GeneratedWebsiteProject): string[] {
  const sections = project.sitePlan?.sections ?? [];
  return sections
    .filter((s) => /faq|pricing|service|feature/i.test(s.name))
    .map((s) => `What is ${s.name}?`)
    .slice(0, 5);
}
