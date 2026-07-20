/**
 * App Design Platform — public exports (App Builder only).
 */

export type * from "@/lib/ai-core/app-design-platform/types";

export {
  APP_TEMPLATES,
  getAppTemplate,
  listAppTemplates,
  matchTemplateFromSignals,
  type AppTemplateDefinition,
} from "@/lib/ai-core/app-design-platform/templates";

export {
  APP_COMPONENT_LIBRARY,
  getAppComponent,
  listComponentsForTemplate,
} from "@/lib/ai-core/app-design-platform/components";

export {
  runAppDesignEngine,
  deriveAppName,
  resolveTemplateId,
  type AppDesignInput,
} from "@/lib/ai-core/app-design-platform/design-engine";

export {
  buildStructuredAppModel,
  updateAppSettings,
  upsertCatalogItem,
  deleteCatalogItem,
  removeScreen,
  addScreen,
} from "@/lib/ai-core/app-design-platform/model-builder";

export {
  listDataModels,
  getDataModel,
  upsertDataModel,
  connectScreenToData,
  deriveScreenDataBindings,
  describeBackendWorkflows,
  toPrismaSchemaSketch,
} from "@/lib/ai-core/app-design-platform/data";

export {
  listRoles,
  upsertRole,
  canAccessScreen,
  summarizePermissions,
} from "@/lib/ai-core/app-design-platform/roles";

export {
  buildEditorTreeForScreen,
  createVisualEditorState,
  selectScreen,
  updateNodeProps,
  applyEditorTreeToModel,
  reorderChild,
  selectNode,
  updateNodeStyles,
  addComponentToScreen,
  removeComponentFromModel,
  reorderScreens,
  reorderComponentsOnScreen,
  listEditorComponentPalette,
  applyEditorReorder,
} from "@/lib/ai-core/app-design-platform/visual-editor";

export { syncAppModelToFiles, syncPagesFromModel } from "@/lib/ai-core/app-design-platform/sync";

export { runAppAssistantAgent } from "@/lib/ai-core/app-design-platform/assistant-agent";

export {
  provisionAppBackend,
  generateCrudApiRoute,
  generateSupabaseClientFile,
} from "@/lib/ai-core/app-design-platform/backend";

export {
  createDeployment,
  extractDeploymentState,
  upsertDeploymentState,
  updateDeploymentEnv,
  buildDeploymentUrl,
  type AppDeploymentRecord,
  type AppDeploymentState,
} from "@/lib/ai-core/app-design-platform/deploy";

export {
  executeWorkflow,
  registerWebhook,
  runModelWorkflows,
  type WorkflowExecution,
} from "@/lib/ai-core/app-design-platform/workflows";

export { buildAppBuilderHealthReport } from "@/lib/ai-core/app-design-platform/production-health";

export {
  PREVIEW_DEVICE_FRAMES,
  buildAppPreviewPayload,
  previewScreenSummary,
} from "@/lib/ai-core/app-design-platform/preview";

export {
  brandKitFromIdentityBrief,
  applyBrandKitToModel,
  brandTokensToCssVars,
  type BrandKitInput,
} from "@/lib/ai-core/app-design-platform/brand";

export { runAppAssistant } from "@/lib/ai-core/app-design-platform/assistant";

export { runAppIntelligence } from "@/lib/ai-core/app-design-platform/intelligence";

export {
  emptyVersionHistory,
  saveAppVersion,
  restoreAppVersion,
  compareAppVersions,
  type AppVersionHistory,
} from "@/lib/ai-core/app-design-platform/versions";

export { runAppQualityChecks } from "@/lib/ai-core/app-design-platform/quality";

export {
  extractAppModelFromBlueprint,
  extractVersionHistory,
  withAppModel,
  type WebAppBlueprintBag,
} from "@/lib/ai-core/app-design-platform/management";
