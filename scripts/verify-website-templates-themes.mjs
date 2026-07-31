/**
 * Templates vs Themes separation — Website Builder UI architecture.
 * Usage: node scripts/verify-website-templates-themes.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const structure = read("lib/website/builder/structure-templates.ts");
const packageIndex = read("lib/website/builder/template-package-index.ts");
const catalogMapping = read("lib/website/builder/template-catalog-mapping.ts");
const templateCatalog = read("lib/website/builder/template-catalog.ts");
const themeCatalog = read("lib/website/builder/theme-catalog.ts");
const templatesPanel = read(
  "components/dashboard/website-builder/templates-panel.tsx",
);
const structurePanel = read(
  "components/dashboard/website-builder/website-structure-templates-panel.tsx",
);
const templateEngineRoute = read("app/api/website-builder/template-engine/route.ts");
const themePanel = read(
  "components/dashboard/website-builder/theme-selection-panel.tsx",
);
const designPanel = read(
  "components/dashboard/website-builder/design-system-panel.tsx",
);
const tool = read("components/dashboard/website-builder-tool.tsx");
const masterTypes = read("lib/ai-core/master-planner/types.ts");
const masterEngine = read("lib/ai-core/master-planner/engine.ts");
const themeRoute = read("app/api/website-builder/[id]/theme/route.ts");
const apply = read("lib/ai-core/template-intelligence/apply.ts");
const inject = read("lib/ai-core/components/inject.ts");
const businessIdentity = read("lib/ai-core/template-intelligence/business-identity.ts");
const marketplaceCatalog = read("lib/ai-core/template-marketplace/catalog.ts");
const pkg = read("package.json");

assert.ok(structure.includes("WEBSITE_STRUCTURE_TEMPLATES"), "structure registry required");
assert.ok(
  structure.includes("template-package-index"),
  "structure registry must be backed by the template package index",
);
assert.ok(
  packageIndex.includes("template-catalog-mapping"),
  "package index must map manifests without importing template-catalog",
);
assert.ok(
  catalogMapping.includes("mapPackageManifestToStructureTemplate"),
  "catalog mapping helpers required",
);
assert.ok(
  packageIndex.includes('"modern-business"') || packageIndex.includes("modern-business"),
  "modern-business package must be indexed",
);
assert.ok(
  structure.includes("INTERNAL_GENERATION_STRUCTURE_FALLBACK"),
  "internal generation fallback required",
);
assert.ok(
  templateCatalog.includes("isLegacyMarketplaceStructureTemplate"),
  "legacy marketplace compatibility guard required",
);
assert.ok(
  templateEngineRoute.includes("engine.listTemplates()"),
  "template-engine API must list installed packages",
);
for (const id of [
  "restaurant",
  "travel",
  "medical",
  "real-estate",
  "automotive",
  "saas",
  "law-firm",
  "portfolio",
]) {
  assert.ok(
    !structure.includes(`id: "${id}"`),
    `legacy structure template ${id} must be removed`,
  );
}

assert.ok(
  marketplaceCatalog.includes("MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = []"),
  "marketplace catalog must be empty",
);

assert.ok(themeCatalog.includes("WEBSITE_THEME_CATALOG"), "theme catalog required");
assert.ok(
  themeCatalog.includes("resolveThemeTemplateIntelligenceId"),
  "theme resolver required",
);

assert.ok(
  structurePanel.includes("TemplatesPanel"),
  "structure panel must re-export templates placeholder",
);
assert.ok(
  templatesPanel.includes("WbTemplateMarketplaceCatalog"),
  "templates panel must load templates from the marketplace catalog UI",
);
assert.ok(
  read("components/dashboard/template-marketplace/wb-template-marketplace-catalog.tsx").includes(
    "fetchBuilderTemplateRuntimeModel",
  ),
  "marketplace catalog must resolve runtime models on selection",
);
assert.ok(
  read("components/dashboard/template-marketplace/wb-template-marketplace-catalog.tsx").includes(
    "fetchTemplateMarketplaceCatalog",
  ),
  "marketplace catalog must consume the template marketplace API",
);
assert.ok(
  read("components/dashboard/template-marketplace/template-marketplace.tsx").includes(
    "WbTemplateMarketplaceCatalog",
  ),
  "template marketplace page must use the shared marketplace catalog",
);

const useTemplateRuntime = read("lib/website/builder/use-template-runtime.ts");
const builderIndex = read("lib/website/builder/index.ts");
assert.ok(
  useTemplateRuntime.includes("builder-template-runtime-session.client"),
  "use-template-runtime must import the client-only session module",
);
assert.ok(
  !useTemplateRuntime.includes("@/lib/website/builder/template-runtime-session"),
  "use-template-runtime must not import the shared template-runtime-session module",
);
assert.ok(
  builderIndex.includes("builder-template-runtime-session.client"),
  "builder index must re-export the client-only session module",
);
assert.ok(
  !builderIndex.includes("@/lib/website/builder/template-runtime-session"),
  "builder index must not reference the removed template-runtime-session module",
);

assert.ok(
  themePanel.includes("WEBSITE_THEME_CATALOG"),
  "theme panel must use curated theme catalog",
);
assert.ok(
  themePanel.includes("layoutType") && themePanel.includes("heroType"),
  "theme panel must show layout metadata not just colors",
);
assert.ok(
  themePanel.includes("pageTopology"),
  "theme panel must show page topology",
);

const themeArch = read("lib/website/builder/theme-architecture.ts");
assert.ok(themeArch.includes("THEME_PAGE_ARCHITECTURES"), "theme architecture registry required");
assert.ok(themeArch.includes("pageTopology"), "theme architecture must define page topologies");
const themeRegistry = read("lib/website/builder/theme-component-registry.ts");
const themeLibraries = read("lib/ai-core/components/scaffolds/themes/libraries.ts");
assert.ok(themeRegistry.includes("THEME_COMPONENT_LIBRARIES"), "theme component registry required");
assert.ok(themeRegistry.includes("assertThemeLibrariesAreDisjoint"), "theme libraries must be disjoint");
assert.ok(themeLibraries.includes("ThemeLuxuryNav"), "luxury theme library required");
assert.ok(themeLibraries.includes("ThemeTechNav"), "technology theme library required");
assert.ok(themeLibraries.includes("ThemeBoldFloatingCta"), "bold theme library required");
assert.ok(
  inject.includes("websiteThemeId"),
  "inject must support exclusive theme component libraries",
);
assert.ok(
  !themeArch.includes("NavHamburger"),
  "theme architecture must use exclusive theme-scoped component IDs",
);
assert.ok(themeArch.includes("getThemeComponentIds"), "architecture must use theme component registry");

assert.ok(
  apply.includes("resolveThemePageArchitecture"),
  "retheme must resolve theme page architecture",
);
assert.ok(
  inject.includes("pageTopology"),
  "inject must support theme page topology",
);
assert.ok(
  inject.includes("sectionShellVariant"),
  "inject must support per-theme section shells",
);

assert.ok(
  !designPanel.includes("BUILDER_THEME_PRESETS"),
  "design sidebar must not duplicate theme presets",
);

assert.ok(tool.includes("WebsiteStructureTemplatesPanel"), "tool must render structure panel");
assert.ok(tool.includes("ThemeSelectionPanel"), "tool must render themes panel");
assert.ok(
  !tool.includes("TemplateSelectionPanel"),
  "legacy marketplace gallery must be removed from tool",
);
assert.ok(
  !tool.includes("hints.browseMarketplace"),
  "browse marketplace link must be removed from tool",
);
assert.ok(tool.includes("websiteStructureTemplateId"), "tool must track structure template");
assert.ok(tool.includes("websiteThemeId"), "tool must track theme");

assert.ok(masterTypes.includes("theme: string"), "master plan must include theme");
assert.ok(
  masterEngine.includes("resolveThemeTemplateIntelligenceId"),
  "master planner must pick theme separately",
);
assert.ok(
  masterEngine.includes("resolveStructureTemplateForIndustry"),
  "master planner must pick structure separately",
);

assert.ok(
  themeRoute.includes("applyTemplateIntelligenceRetheme"),
  "theme route must perform full design rebuild",
);
assert.ok(
  !themeRoute.includes("applyTemplateVisualSwitch"),
  "theme route must not be visual-only",
);

assert.ok(
  businessIdentity.includes("extractBusinessIdentity"),
  "business identity module required",
);
assert.ok(
  apply.includes("extractBusinessIdentity"),
  "template switch must lock business identity",
);
assert.ok(
  apply.includes("forceDesignRebuild: true"),
  "template switch must force full design rebuild",
);
assert.ok(
  inject.includes("forceDesignRebuild"),
  "inject must support forced design rebuild",
);
assert.ok(
  tool.includes("applyTemplateIntelligenceToActiveProject"),
  "structure template select must support legacy redesign on active project",
);
assert.ok(
  tool.includes("isLegacyMarketplaceStructureTemplate"),
  "structure template select must skip legacy TI for installed packages",
);
assert.ok(
  tool.includes("useBuilderTemplateRuntime"),
  "tool must resolve template runtime models from installed packages",
);
assert.ok(
  tool.includes("wb-template-package:"),
  "generation must include installed template package feature flags",
);

assert.ok(
  pkg.includes("verify:website-templates-themes"),
  "package.json must register verify script",
);

console.log("✓ Templates vs Themes separation verified");
