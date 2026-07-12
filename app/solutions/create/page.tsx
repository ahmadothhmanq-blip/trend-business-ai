import type { Metadata } from "next";
import { MarketingSolutionPage } from "@/components/marketing/marketing-solution-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Create — AI Websites, Apps & Landing Pages",
  description:
    "Build websites, apps and landing pages with Trend Business AI Create products.",
  path: "/solutions/create",
});

/** Legacy route — same experience as /products/create */
export default function CreateSolutionPage() {
  return <MarketingSolutionPage id="create" />;
}
