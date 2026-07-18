/**
 * AI Design System engine (Phase 7).
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
  normalizeDesignPreset,
} from "@/lib/ai-core/design-system/presets";

export {
  buildAiDesignSystemFromStrategy,
  aiDesignSystemToCore,
  mergeCoreDesignWithAiDecisions,
  type BuildAiDesignSystemInput,
} from "@/lib/ai-core/design-system/build";
