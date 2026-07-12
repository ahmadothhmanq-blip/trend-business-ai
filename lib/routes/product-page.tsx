import type { Metadata } from "next";
import { MarketingProductPage } from "@/components/marketing/marketing-product-page";
import {
  getMarketingProduct,
  type MarketingProductSlug,
} from "@/lib/constants/marketing-content";
import { createPageMetadata } from "@/lib/seo/metadata";

export function productMetadata(slug: MarketingProductSlug): Metadata {
  const product = getMarketingProduct(slug);
  return createPageMetadata({
    title: product?.title ?? "AI Product",
    description:
      product?.description ??
      "Explore Trend Business AI products for create, design, content and business workflows.",
    path: `/products/${slug}`,
  });
}

export function ProductRoutePage({ slug }: { slug: MarketingProductSlug }) {
  return <MarketingProductPage slug={slug} />;
}
