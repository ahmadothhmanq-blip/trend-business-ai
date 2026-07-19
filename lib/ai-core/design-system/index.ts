/**
 * AI Design System Engine.
 * Presets → DeepSeek generation → persist → Website Builder apply.
 */

export type {
  AiDesignSystem,
  DesignAnimationStyle,
  DesignColorPalette,
  DesignComponentStyle,
  DesignPresetId,
  DesignSpacingSystem,
  DesignTypographySystem,
  DesignUiStyle,
} from "@/lib/ai-core/design-system/types";

export {
  DESIGN_PRESETS,
  DESIGN_PRESET_IDS,
  getDesignPreset,
  listDesignPresets,
  normalizeDesignPreset,
} from "@/lib/ai-core/design-system/presets";

export {
  buildAiDesignSystemFromStrategy,
  aiDesignSystemToCore,
  mergeCoreDesignWithAiDecisions,
  type BuildAiDesignSystemInput,
} from "@/lib/ai-core/design-system/build";

export {
  generateDesignSystem,
  type GenerateDesignSystemInput,
  type GenerateDesignSystemResult,
} from "@/lib/ai-core/design-system/generate";

export {
  persistGeneratedDesign,
  type PersistGeneratedDesignParams,
  type PersistGeneratedDesignResult,
} from "@/lib/ai-core/design-system/persist";