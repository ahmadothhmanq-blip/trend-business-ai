/**
 * Platform component registry — semantic roles supported by the builder.
 */

import type { SectionRole } from "@/lib/website-builder-platform/contracts/template-layer";

export const PLATFORM_SECTION_COMPONENTS: SectionRole[] = [
  "hero",
  "about",
  "features",
  "services",
  "portfolio",
  "team",
  "pricing",
  "faq",
  "contact",
  "forms",
  "blog",
  "footer",
  "navigation",
  "testimonials",
  "cta",
  "gallery",
  "timeline",
  "statistics",
];

export const PLATFORM_PAGE_TYPES = [
  "home",
  "about",
  "services",
  "contact",
  "pricing",
  "blog",
  "portfolio",
  "careers",
  "privacy",
  "terms",
  "custom",
] as const;

export type PlatformPageType = (typeof PLATFORM_PAGE_TYPES)[number];
