/**
 * TBGE product adapter registry — product-agnostic resolution.
 */

import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import type { TbgeProductId } from "@/lib/tbge/spec/types";

const ADAPTER_REGISTRY: Partial<Record<TbgeProductId, TbgeProductAdapter>> = {
  "website-builder": websiteBuilderTbgeAdapter,
};

export function resolveTbgeProductAdapter(
  productId: TbgeProductId,
): TbgeProductAdapter | undefined {
  return ADAPTER_REGISTRY[productId];
}

export function registerTbgeProductAdapter(adapter: TbgeProductAdapter): void {
  ADAPTER_REGISTRY[adapter.productId] = adapter;
}

export function listTbgeProductAdapters(): TbgeProductAdapter[] {
  return Object.values(ADAPTER_REGISTRY).filter(
    (adapter): adapter is TbgeProductAdapter => Boolean(adapter),
  );
}
