/**
 * AI Design Renderer Engine — strategy + industry → premium UI layout plan.
 */

export type {
  DesignRendererComponentId,
  DesignRendererSection,
  DesignRendererVisualStyle,
  DesignRenderPlan,
  DesignRendererInput,
  DesignRendererResult,
} from "@/lib/ai-core/design-renderer/types";

export {
  DESIGN_RENDERER_COMPONENTS,
  getRendererComponent,
  componentPathFor,
} from "@/lib/ai-core/design-renderer/components";

export {
  INDUSTRY_DESIGN_PRESETS,
  getIndustryDesignPreset,
} from "@/lib/ai-core/design-renderer/presets";

export { renderWebsiteDesign } from "@/lib/ai-core/design-renderer/render";
