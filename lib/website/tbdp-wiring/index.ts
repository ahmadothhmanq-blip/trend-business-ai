/**
 * TBDP Phase 6 — Website Builder Wiring
 *
 * Wires the Website Builder lifecycle to TBDP as the official design source.
 * Additive only — identical behavior when TBDP signals are absent.
 */

export {
  TBDP_WIRING_PHASE,
  TBDP_WIRING_VERSION,
  TBDP_BRIEF_META_KEY,
  TBDP_VISUAL_AUTHORITY_META_KEY,
} from "@/lib/website/tbdp-wiring/constants";

export type * from "@/lib/website/tbdp-wiring/types";

export {
  designContextToSettingsPatch,
  storedContextFromDesignContext,
  readStoredContextFromSettings,
  resolveDesignContextFromSettings,
  resolveDesignContextForTemplate,
  mergeTbdpSettings,
} from "@/lib/website/tbdp-wiring/design-context-store";

export {
  wireWebsiteGenerationStart,
  wireAiGeneration,
  wireBriefMetadata,
} from "@/lib/website/tbdp-wiring/wire-generation";

export {
  wireTemplateApply,
  applyTbdpSettingsToProject,
} from "@/lib/website/tbdp-wiring/wire-template";

export {
  wirePreviewContext,
  previewInputFromTbdpSettings,
  appendTbdpPreviewCss,
} from "@/lib/website/tbdp-wiring/wire-preview";

export {
  isTbdpVisualAuthority,
  applyTbdpToDesignSystem,
  resolveTbdpDesignContextFromBrief,
} from "@/lib/website/tbdp-wiring/wire-design-system";

export { validateWebsiteAgainstTbdp } from "@/lib/website/tbdp-wiring/validate";
