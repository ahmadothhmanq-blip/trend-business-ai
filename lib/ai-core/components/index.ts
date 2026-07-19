/**
 * Professional Components Library for Website Builder.
 * Catalog + selection intelligence + premium TSX scaffolds.
 */

export type {
  SectionKind,
  HeroVariant,
  NavVariant,
  WebsiteGoal,
  ProfessionalComponentDefinition,
  ComponentSelectionContext,
  ComponentSelectionResult,
  SelectedHomeSection,
} from "@/lib/ai-core/components/types";

export {
  PROFESSIONAL_COMPONENT_CATALOG,
  getCatalogEntry,
  listCatalogByKind,
} from "@/lib/ai-core/components/catalog";

export { selectProfessionalComponents } from "@/lib/ai-core/components/select";

export {
  resolveWebsiteGoal,
  sectionOrderForGoal,
} from "@/lib/ai-core/components/goals";

export { composeHomePage } from "@/lib/ai-core/components/compose";

export {
  injectProfessionalComponents,
  hasProfessionalScaffold,
} from "@/lib/ai-core/components/inject";

export {
  getProfessionalScaffoldById,
  getProfessionalScaffoldByPath,
  listProfessionalScaffoldPaths,
  SECTION_SHELL_PATH,
  MOTION_PATH,
} from "@/lib/ai-core/components/scaffolds";
