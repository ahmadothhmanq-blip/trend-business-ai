import type { Metadata } from "next";
import { MarketingSolutionPage } from "@/components/marketing/marketing-solution-page";
import {
  AI_PRODUCT_CATEGORIES,
  type AiProductCategoryId,
} from "@/lib/constants/marketing-content";
import { createPageMetadata } from "@/lib/seo/metadata";

const META: Record<
  AiProductCategoryId,
  { title: string; description: string }
> = {
  create: {
    title: "Create — AI Websites, Apps & Landing Pages",
    description:
      "Build websites, apps and landing pages with Trend Business AI Create products.",
  },
  design: {
    title: "Design — AI Logos, Brand & Images",
    description:
      "Create logos, brand identities and AI images with Trend Business AI Design products.",
  },
  content: {
    title: "Content — AI Video, Social & Writing",
    description:
      "Generate videos, social content and channel plans with Trend Business AI Content products.",
  },
  business: {
    title: "Business — Marketing, Ops & Intelligence",
    description:
      "Run marketing, project management, business intelligence and feasibility studies with AI.",
  },
};

export function categoryMetadata(id: AiProductCategoryId): Metadata {
  const meta = META[id];
  return createPageMetadata({
    title: meta.title,
    description: meta.description,
    path: `/products/${id}`,
  });
}

export function CategoryRoutePage({ id }: { id: AiProductCategoryId }) {
  const category = AI_PRODUCT_CATEGORIES.find((item) => item.id === id);
  if (!category) {
    throw new Error(`Unknown product category: ${id}`);
  }
  return <MarketingSolutionPage id={id} />;
}
