import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";

/**
 * Legacy adapter instance map (side-effect registration from adapter modules).
 * Phase 5 canonical catalog + factories live in `lib/ai-core/products.ts`.
 */
const adapters = new Map<string, ProductEngineAdapter<unknown, unknown>>();

export function registerProductEngineAdapter<TGen, TFinal>(
  adapter: ProductEngineAdapter<TGen, TFinal>,
): void {
  adapters.set(
    adapter.productId,
    adapter as ProductEngineAdapter<unknown, unknown>,
  );
}

export function getProductEngineAdapter(
  productId: string,
): ProductEngineAdapter<unknown, unknown> | undefined {
  return adapters.get(productId);
}

export function listProductEngineAdapters(): ProductEngineAdapter<
  unknown,
  unknown
>[] {
  return [...adapters.values()];
}

export function clearProductEngineAdaptersForTests(): void {
  adapters.clear();
}
