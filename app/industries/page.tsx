import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedIndustries, industryPath } from "@/lib/seo/industries";

export const metadata: Metadata = SeoService.createMetadata({
  title: "AI Business Tools by Industry",
  description:
    "Industry-focused AI workspaces for SaaS, ecommerce, agencies, startups and more — plan, create and grow with Trend Business AI.",
  path: "/industries",
  type: "collection",
});

export default function IndustriesIndexPage() {
  const items = getPublishedIndustries().map((industry) => ({
    href: industryPath(industry.slug),
    title: industry.title,
    description: industry.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/industries"
      eyebrow="Industries"
      title="Built for how your industry ships"
      description="Explore industry landings that connect planning, branding, content and go-to-market workflows to your market context."
      items={items}
    />
  );
}
