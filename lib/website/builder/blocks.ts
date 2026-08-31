/**
 * Website Builder — block library services (Phase 3).
 */

import {
  listMarketplaceComponents,
  type MarketplaceComponent,
} from "@/lib/ai-core/component-marketplace";
import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";

export type BuilderBlockCategory =
  | "all"
  | "hero"
  | "section"
  | "cta"
  | "proof"
  | "media"
  | "layout";

export type BuilderBlockView = {
  id: string;
  name: string;
  exportName: string;
  path: string;
  sectionKind: string;
  category: BuilderBlockCategory;
  description?: string;
};

function mapCategory(kind: string): BuilderBlockCategory {
  if (kind === "hero" || kind === "header") return "hero";
  if (kind === "cta") return "cta";
  if (kind === "testimonials" || kind === "brand-trust" || kind === "case-studies") {
    return "proof";
  }
  if (kind.includes("gallery") || kind === "video") return "media";
  if (kind === "footer" || kind === "grid") return "layout";
  return "section";
}

export function toBuilderBlockView(component: MarketplaceComponent): BuilderBlockView {
  return {
    id: component.id,
    name: component.name,
    exportName: component.exportName,
    path: component.path,
    sectionKind: component.sectionKind,
    category: mapCategory(component.sectionKind),
    description: component.description,
  };
}

export function listBuilderBlocks(params?: {
  category?: BuilderBlockCategory;
  query?: string;
  capabilityService?: WebsiteCapabilityService;
}): BuilderBlockView[] {
  const all = listMarketplaceComponents().map(toBuilderBlockView);
  const category = params?.category ?? "all";
  const query = params?.query?.trim().toLowerCase();
  const service = params?.capabilityService;

  return all.filter((block) => {
    if (service && !blockMatchesCapabilities(block, service)) return false;
    if (category !== "all" && block.category !== category) return false;
    if (!query) return true;
    return (
      block.name.toLowerCase().includes(query) ||
      block.exportName.toLowerCase().includes(query) ||
      (block.description?.toLowerCase().includes(query) ?? false)
    );
  });
}

const BLOCK_CATEGORY_CAPABILITIES: Partial<
  Record<BuilderBlockCategory, WebsiteCapabilityId[]>
> = {
  proof: ["testimonials", "reviews", "portfolio"],
  media: ["gallery", "portfolio", "products", "team"],
};

function blockMatchesCapabilities(
  block: BuilderBlockView,
  service: WebsiteCapabilityService,
): boolean {
  if (block.category === "hero" || block.category === "cta" || block.category === "layout") {
    return true;
  }
  const required = BLOCK_CATEGORY_CAPABILITIES[block.category];
  if (!required?.length) return true;
  return service.hasAnyCapability(required);
}

export function reorderBuilderSections<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next;
}
