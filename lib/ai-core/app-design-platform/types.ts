/**
 * App Design Platform — structured application model.
 * App Builder / webapp-builder only.
 */

export type AppTemplateId =
  | "restaurant"
  | "ecommerce"
  | "booking"
  | "crm"
  | "erp"
  | "inventory"
  | "saas-dashboard"
  | "education"
  | "real-estate"
  | "automotive"
  | "healthcare"
  | "finance"
  | "custom";

export type AppArchitecture =
  | "dashboard-sidebar"
  | "multi-tenant-saas"
  | "marketplace"
  | "booking-calendar"
  | "pos-retail"
  | "crm-pipeline"
  | "erp-modules"
  | "learning-portal"
  | "content-catalog";

export type AppScreen = {
  id: string;
  name: string;
  path: string;
  purpose: string;
  layout: "sidebar" | "topnav" | "auth" | "blank" | "split";
  components: string[];
  dataBindings: string[];
  roles: string[];
  order: number;
};

export type AppComponentInstance = {
  id: string;
  type: string;
  screenId: string;
  props: Record<string, unknown>;
  children?: string[];
};

export type AppNavigationItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  roles?: string[];
  children?: AppNavigationItem[];
};

export type AppDataField = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "enum" | "relation" | "json" | "money" | "image";
  required?: boolean;
  unique?: boolean;
  enumValues?: string[];
  relationTo?: string;
  defaultValue?: string | number | boolean | null;
};

export type AppDataModel = {
  id: string;
  name: string;
  label: string;
  fields: AppDataField[];
  relations: Array<{
    name: string;
    target: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
  }>;
  crud: Array<"create" | "read" | "update" | "delete" | "list">;
};

export type AppRole = {
  id: string;
  name: string;
  description: string;
  permissions: {
    screens: string[];
    actions: string[];
    dataAccess: "all" | "own" | "team" | "none";
  };
};

export type AppWorkflow = {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  roles: string[];
};

export type AppDesignTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
  success: string;
  warning: string;
  danger: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
  density: "compact" | "comfortable" | "spacious";
};

export type AppBrandState = {
  businessName: string;
  logoUrl?: string | null;
  brandIdentityId?: string | null;
  tokens: AppDesignTokens;
};

export type AppCatalogItem = {
  id: string;
  type: "product" | "menu-item" | "service" | "booking-slot" | "course" | "property" | "vehicle" | "custom";
  title: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  status?: "draft" | "published" | "archived";
  meta?: Record<string, string>;
  updatedAt: string;
};

export type AppSettings = {
  appName: string;
  tagline?: string;
  language: string;
  timezone?: string;
  currency?: string;
  features: string[];
  darkModeDefault?: boolean;
};

export type StructuredAppModel = {
  version: number;
  templateId: AppTemplateId;
  architecture: AppArchitecture;
  industry: string;
  appType: string;
  settings: AppSettings;
  brand: AppBrandState;
  screens: AppScreen[];
  navigation: AppNavigationItem[];
  components: AppComponentInstance[];
  dataModels: AppDataModel[];
  roles: AppRole[];
  workflows: AppWorkflow[];
  catalog: AppCatalogItem[];
  featureFlags: string[];
  createdAt: string;
  updatedAt: string;
};

export type AppDesignBlueprint = {
  idea: string;
  industry: string;
  appType: string;
  templateId: AppTemplateId;
  architecture: AppArchitecture;
  screens: string[];
  navigationFlow: string[];
  features: string[];
  roles: string[];
  workflows: string[];
  dataEntities: string[];
  confidence: number;
  reason: string;
};

export type AppIntelligenceSuggestion = {
  id: string;
  category:
    | "missing-screen"
    | "missing-feature"
    | "user-flow"
    | "ux"
    | "performance"
    | "industry"
    | "security"
    | "data";
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  command?: string;
  impact?: string;
};

export type AppIntelligenceReport = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  suggestions: AppIntelligenceSuggestion[];
  strengths: string[];
  generatedAt: string;
};

export type AppQualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  severity: "blocker" | "warning" | "info";
  detail: string;
};

export type AppQualityReport = {
  ready: boolean;
  score: number;
  checks: AppQualityCheck[];
  summary: string;
};

export type AppVersionSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  note?: string;
  model: StructuredAppModel;
};

export type AppAssistantResult = {
  understood: string;
  actions: string[];
  applied: boolean;
  notes: string[];
  model?: StructuredAppModel;
  command?: string;
};

export type VisualEditorNode = {
  id: string;
  type: string;
  label: string;
  props: Record<string, unknown>;
  children: VisualEditorNode[];
};

export type VisualEditorState = {
  selectedScreenId: string | null;
  selectedNodeId: string | null;
  device: "mobile" | "tablet" | "desktop";
  tree: VisualEditorNode[];
};

export type AppPreviewDevice = "mobile" | "tablet" | "desktop";

export type AppPreviewPayload = {
  appName: string;
  device: AppPreviewDevice;
  screens: Array<{ id: string; name: string; path: string }>;
  navigation: AppNavigationItem[];
  brand: AppBrandState;
  activeScreenId: string | null;
};
