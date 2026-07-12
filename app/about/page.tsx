import type { Metadata } from "next";
import { MarketingAboutPage } from "@/components/marketing/marketing-about-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Trend Business AI is a next-generation AI platform to build, automate and scale websites, apps, content, marketing and business intelligence.",
  path: "/about",
});

export default function AboutPage() {
  return <MarketingAboutPage />;
}
