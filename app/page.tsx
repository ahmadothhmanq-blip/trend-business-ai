import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing";
import { HomeFaqJsonLd, SiteWideJsonLd } from "@/components/seo/site-json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_TITLE } from "@/lib/seo/site";

export const metadata: Metadata = {
  ...createPageMetadata({
    path: "/",
    type: "website",
  }),
  title: {
    absolute: DEFAULT_TITLE,
  },
};

export default function Home() {
  return (
    <>
      <SiteWideJsonLd />
      <HomeFaqJsonLd />
      <MarketingPage />
    </>
  );
}
