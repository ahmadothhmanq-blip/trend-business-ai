/**
 * Website Builder services — public exports (Phases 1–8).
 */

export type {
  BuilderSectionView,
  BuilderPageView,
  BuilderWorkspaceStructure,
  BuilderVersionSnapshot,
  BuilderAutosaveState,
} from "@/lib/website/builder/types";

export {
  resolveBuilderPages,
  resolveBuilderSections,
  resolveBuilderWorkspaceStructure,
  sectionToCopilotSelection,
} from "@/lib/website/builder/structure";

export {
  BUILDER_AUTOSAVE_DEBOUNCE_MS,
  createBuilderAutosaveScheduler,
  type BuilderAutosaveScheduler,
} from "@/lib/website/builder/autosave";

export {
  BUILDER_VERSION_MAX_SNAPSHOTS,
  listBuilderVersionSnapshots,
  pushBuilderVersionSnapshot,
  findBuilderVersionSnapshot,
} from "@/lib/website/builder/version-history";

export {
  BUILDER_THEME_PRESETS,
  BUILDER_SPACING_MAP,
  spacingPresetFromSectionY,
  resolveBuilderDesignTokens,
  mergeThemePreset,
  type BuilderThemePreset,
  type BuilderSpacingPreset,
} from "@/lib/website/builder/design-system";

export {
  WEBSITE_STRUCTURE_TEMPLATES,
  getWebsiteStructureTemplate,
  resolveStructureTemplateForIndustry,
  type WebsiteStructureTemplate,
  type WebsiteStructureTemplateId,
  type WebsiteStructureTemplateChoice,
} from "@/lib/website/builder/structure-templates";

export {
  mapListItemToStructureTemplate,
  mapListItemToStructureTemplateChoice,
  isLegacyMarketplaceStructureTemplate,
  toStructureTemplateChoice,
  extractAllowedComponentsFromRuntimeModel,
  BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID,
} from "@/lib/website/builder/template-catalog";

export { fetchBuilderTemplateCatalog } from "@/lib/website/builder/template-catalog-client";

export {
  WEBSITE_THEME_CATALOG,
  getWebsiteThemeEntry,
  resolveThemeForStyle,
  resolveThemeTemplateIntelligenceId,
  type WebsiteThemeCatalogEntry,
  type WebsiteThemePresetId,
} from "@/lib/website/builder/theme-catalog";

export {
  BUILDER_BREAKPOINTS,
  getBuilderBreakpoint,
  type BuilderBreakpoint,
} from "@/lib/website/builder/responsive";

export {
  listBuilderBlocks,
  reorderBuilderSections,
  toBuilderBlockView,
  type BuilderBlockView,
  type BuilderBlockCategory,
} from "@/lib/website/builder/blocks";

export {
  AI_BUILDER_ACTIONS,
  getAiBuilderAction,
  type AiBuilderAction,
} from "@/lib/website/builder/ai-builder";

export { PROFESSIONAL_FEATURES, type ProfessionalFeature } from "@/lib/website/builder/professional";

export { BUSINESS_FEATURES, type BusinessFeature } from "@/lib/website/builder/business";

export {
  WEBSITE_FEATURE_REGISTRY,
  resolveWebsiteFeatures,
  normalizeWebsiteFeatureId,
  normalizeWebsiteFeatureList,
  listBuilderDefaultFeatures,
  listAllWebsiteBuilderFeatures,
  BUILDER_PANEL_FEATURES,
  BUILDER_PANEL_FEATURE_I18N,
  DEFAULT_BUILDER_PANEL_FEATURES,
  hydrateBuilderPanelFeatures,
  type BuilderPanelFeatureLabel,
  applyFeaturesToAnalysis,
  applyFeaturesToStrategy,
  applyFeaturesToCapabilityFlags,
  mergeFeatureFilePlans,
  type WebsiteFeatureDefinition,
  type WebsiteFeatureCategory,
  type ResolvedWebsiteFeatures,
} from "@/lib/website/builder/feature-registry";

export {
  PUBLISHING_CHECKLIST,
  runBuilderAccessibilityHeuristics,
  type PublishingChecklistItem,
  type BuilderAccessibilityIssue,
} from "@/lib/website/builder/publishing";

export {
  BUILDER_ROLE_PERMISSIONS,
  builderRoleCan,
  ENTERPRISE_CAPABILITIES,
  type BuilderMemberRole,
  type BuilderGenerationMember,
} from "@/lib/website/builder/enterprise";

export {
  BUILDER_INVITATION_TTL_DAYS,
  createInvitationExpiry,
  isInvitationExpired,
  mapCollaborationMember,
  type BuilderMemberStatus,
  type BuilderGenerationMemberRecord,
} from "@/lib/website/builder/collaboration";

export {
  formatWebsiteBuilderApiError,
  readWebsiteBuilderApiError,
} from "@/lib/website/builder/client-api-error";

export type {
  BuilderTemplateRuntimeFailure,
  BuilderTemplateRuntimeResult,
  BuilderTemplateRuntimeScope,
  BuilderTemplateRuntimeSuccess,
  BuilderTemplateRuntimeListResponse,
} from "@/lib/website/builder/template-runtime.types";
export { formatBuilderTemplateRuntimeError } from "@/lib/website/builder/template-runtime.types";
export {
  getActiveBuilderTemplateRuntimeMeta,
  getActiveBuilderTemplateRuntimeModel,
  clearActiveBuilderTemplateRuntime,
  setActiveBuilderTemplateRuntime,
} from "@/lib/website/builder/builder-template-runtime-session.client";
export {
  fetchBuilderTemplateRuntimeModel,
  fetchInstalledBuilderTemplatePackageIds,
} from "@/lib/website/builder/template-runtime-client";
export {
  useBuilderTemplateRuntime,
  type BuilderTemplateRuntimeState,
} from "@/lib/website/builder/use-template-runtime";
