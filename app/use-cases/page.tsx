import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";

export const metadata: Metadata = SeoService.createMetadata({
  title: "AI Use Cases for Founders & Growth Teams",
  description:
    "Explore published use cases for startups, agencies and growth teams — websites, branding, content systems and more with Trend Business AI.",
  path: "/use-cases",
  type: "collection",
});

export default function UseCasesIndexPage() {
  const items = getPublishedProgrammaticPages("use-cases").map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/use-cases"
      eyebrow="Use cases"
      title="AI workflows that match how you ship"
      description="Practical landing pages for how teams actually use Trend Business AI — from startup websites to agency branding and content engines."
      items={items}
    />
  );
}
