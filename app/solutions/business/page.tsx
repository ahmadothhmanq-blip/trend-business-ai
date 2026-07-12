import type { Metadata } from "next";
import { MarketingSolutionPage } from "@/components/marketing/marketing-solution-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Business — Marketing, Intelligence & Feasibility",
  description:
    "Marketing, business management, intelligence and feasibility with Trend Business AI Business products.",
  path: "/solutions/business",
});

/** Legacy route — same experience as /products/business */
export default function BusinessSolutionPage() {
  return <MarketingSolutionPage id="business" />;
}
