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
  assertBuilderAccess,
  resolveBuilderAccess,
  type BuilderAccessLevel,
} from "@/lib/website/builder/access";

export {
  submitWebsiteCopilotCommand,
  shouldUseCopilotStream,
} from "@/lib/website/builder/copilot-client";

export {
  deliverBuilderInvitationEmail,
  sendBuilderInvitationEmail,
  buildBuilderInvitationUrl,
  renderBuilderInvitationEmail,
  type BuilderEmailDeliveryStatus,
} from "@/lib/website/builder/invitation-email";
