import type { Metadata } from "next";
import { MarketingSolutionPage } from "@/components/marketing/marketing-solution-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Design — AI Logos, Brand & Images",
  description:
    "Create logos, brand identities and AI images with Trend Business AI Design products.",
  path: "/solutions/design",
});

/** Legacy route — same experience as /products/design */
export default function DesignSolutionPage() {
  return <MarketingSolutionPage id="design" />;
}
