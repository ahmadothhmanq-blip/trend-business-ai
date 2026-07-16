import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Compare AI Business Platforms & Workflows",
  description:
    "Compare unified AI business suites against fragmented tools — see when an all-in-one workspace wins for planning, creation and growth.",
  path: "/compare",
  type: "collection",
});

export default function CompareIndexPage() {
  const items = getPublishedProgrammaticPages("comparisons").map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/compare"
      eyebrow="Comparisons"
      title="Choose the right AI operating model"
      description="Side-by-side comparisons that help founders and operators decide between fragmented AI chats and a connected business workspace."
      items={items}
    />
  );
}
