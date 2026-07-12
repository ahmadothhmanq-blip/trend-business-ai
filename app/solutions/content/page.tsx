import type { Metadata } from "next";
import { MarketingSolutionPage } from "@/components/marketing/marketing-solution-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Content — AI Video, Social & Publishing",
  description:
    "Generate videos, content and manage social media with Trend Business AI Content products.",
  path: "/solutions/content",
});

/** Legacy route — same experience as /products/content */
export default function ContentSolutionPage() {
  return <MarketingSolutionPage id="content" />;
}
