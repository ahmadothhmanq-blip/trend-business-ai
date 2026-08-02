/**
 * Website Builder shared types and layer modules.
 *
 * Orchestration (canonical):
 *   `@/lib/website-generator` → `lib/deepseek.ts`
 *   → `layerRunner.run(createWebsiteBuilderAdapter())`
 *
 * Stage implementations live under `plugins/website/layers/` and are invoked
 * by the AI Core adapter — not via legacy plugin stage wrappers.
 */

export * from "@/plugins/website/types";
export type * from "@/plugins/website/layers/types";
