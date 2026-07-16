import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";

export const metadata: Metadata = SeoService.createMetadata({
  title: "AI Services for SEO, GTM & Growth",
  description:
    "Service overviews for SEO growth systems, go-to-market planning and AI-assisted brand launch workflows powered by Trend Business AI.",
  path: "/services",
  type: "collection",
});

export default function ServicesIndexPage() {
  const items = getPublishedProgrammaticPages("services").map((page) => ({
    href: page.path,
    title: page.title,
    description: page.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/services"
      eyebrow="Services"
      title="AI-backed services that compound"
      description="Published service pages covering SEO foundations, go-to-market planning and growth systems built on the Trend Business AI platform."
      items={items}
    />
  );
}
