import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { MarketingProductPage } from "@/components/marketing/marketing-product-page";
import {
  getMarketingProduct,
  type MarketingProductSlug,
} from "@/lib/constants/marketing-content";
import { AI_PRODUCT_CATEGORIES } from "@/lib/constants/marketing-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  howToJsonLd,
  productJsonLd,
  softwareApplicationJsonLd,
  videoObjectJsonLd,
} from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";
import type { JsonLd } from "@/lib/seo/json-ld";

export function productMetadata(slug: MarketingProductSlug): Metadata {
  const product = getMarketingProduct(slug);
  return createPageMetadata({
    title: product?.title ?? "AI Product",
    description:
      product?.description ??
      "Explore Trend Business AI products for create, design, content and business workflows.",
    path: `/products/${slug}`,
    type: "product",
    image: product?.image,
    imageAlt: product?.imageAlt,
    keywords: [
      product?.title ?? "AI product",
      "Trend Business AI",
      "AI business tools",
      product?.categoryId ?? "ai",
    ],
  });
}

export function ProductRoutePage({ slug }: { slug: MarketingProductSlug }) {
  const product = getMarketingProduct(slug);
  const category = AI_PRODUCT_CATEGORIES.find((item) => item.id === product?.categoryId);

  if (!product || !category) {
    return <MarketingProductPage slug={slug} />;
  }

  const path = `/products/${slug}`;

  const schemas: JsonLd[] = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: category.title, path: category.href },
      { name: product.title, path },
    ]),
    productJsonLd({
      name: product.title,
      description: product.description,
      path,
      image: product.image,
      category: category.title,
    }),
    softwareApplicationJsonLd({
      name: product.title,
      description: product.description,
      url: absoluteUrl(path),
      applicationCategory: "BusinessApplication",
    }),
    howToJsonLd({
      name: `How to use ${product.title}`,
      description: product.description,
      path,
      steps: [
        {
          name: "Open the product",
          text: `Sign up and open ${product.title} from your Trend Business AI dashboard.`,
        },
        {
          name: "Describe your brief",
          text: "Share goals, audience and constraints for stronger AI output.",
        },
        {
          name: "Save and export",
          text: "Keep results in your private workspace and export when ready.",
        },
      ],
    }),
  ];

  if (slug === "video-studio") {
    schemas.push(
      videoObjectJsonLd({
        name: product.title,
        description: product.description,
        thumbnailPath: product.image,
        path,
      }),
    );
  }

  return (
    <>
      <JsonLdScript id={`product-jsonld-${slug}`} data={schemas} />
      <MarketingProductPage slug={slug} />
    </>
  );
}
