import { resolvePackageBlueprint } from "@/lib/website/template-engine/spec/resolve-blueprint";
import type {
  WbTemplatePackage,
  WbTemplateRenderContext,
  WbTemplateRenderResult,
  WbTemplateResponsiveSpec,
} from "@/lib/website/template-engine/types";
import type {
  WbTemplatePageCanvasBlueprint,
  WbTemplateRegionPlacementRules,
} from "@/lib/website/template-engine/spec/types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeJson(value: unknown): string {
  return escapeHtml(JSON.stringify(value));
}

function renderRegion(
  region: WbTemplatePageCanvasBlueprint["regions"][number],
): string {
  const placement = region.placement;
  const allowed = placement.allowedComponentTypes.join(",");
  const attrs = [
    `data-region-id="${escapeHtml(region.id)}"`,
    `data-region-role="${escapeHtml(region.role)}"`,
    `data-ordering="${escapeHtml(placement.ordering)}"`,
    `data-allow-nesting="${placement.allowNesting ? "true" : "false"}"`,
    `data-max-components="${placement.maxComponents}"`,
    `data-allowed-types="${escapeHtml(allowed)}"`,
    `data-width="${escapeHtml(region.layout.width)}"`,
    `data-alignment="${escapeHtml(region.layout.alignment)}"`,
  ].join(" ");

  return `<section class="wb-tpl-region wb-tpl-region--${escapeHtml(region.role)}" ${attrs}>
  <div class="wb-tpl-region__slot" data-component-slot="true" aria-label="${escapeHtml(region.label ?? region.role)} region">
    <!-- Components are placed here by AI or user at runtime -->
  </div>
</section>`;
}

export function buildWbTemplateRenderStyles(
  blueprint: WbTemplatePageCanvasBlueprint,
  responsive: WbTemplateResponsiveSpec,
): string {
  const canvas = blueprint.canvas;
  const colors = canvas.visualIdentity.colors;
  const typography = canvas.visualIdentity.typography;
  const radius = canvas.visualIdentity.radius.md ?? canvas.visualIdentity.radius.sm ?? "16px";

  const breakpointRules = Object.entries(responsive.breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([name, width]) => {
      return `@media (min-width: ${width}px) {
  .wb-tpl[data-breakpoint="${name}"] .wb-tpl-canvas { max-width: ${responsive.containerMaxWidth ?? canvas.grid.maxWidth ?? "72rem"}; }
}`;
    })
    .join("\n");

  return `:root {
  --wb-tpl-bg: ${colors.background ?? "#0b0b0f"};
  --wb-tpl-fg: ${colors.foreground ?? "#f5f5f7"};
  --wb-tpl-muted: ${colors.muted ?? "rgba(245, 245, 247, 0.62)"};
  --wb-tpl-accent: ${colors.accent ?? colors.primary ?? "#c6a75e"};
  --wb-tpl-primary: ${colors.primary ?? "#c6a75e"};
  --wb-tpl-border: ${canvas.visualIdentity.borders?.default ?? "rgba(255, 255, 255, 0.08)"};
  --wb-tpl-radius: ${radius};
  --wb-tpl-gutter: ${canvas.grid.gutter};
  --wb-tpl-margin: ${canvas.grid.margin};
  --wb-tpl-display-font: ${typography.display}, ui-sans-serif, system-ui, sans-serif;
  --wb-tpl-body-font: ${typography.body}, ui-sans-serif, system-ui, sans-serif;
}

.wb-tpl {
  min-height: 100%;
  background: var(--wb-tpl-bg);
  color: var(--wb-tpl-fg);
  font-family: var(--wb-tpl-body-font);
}

.wb-tpl-canvas {
  margin: 0 auto;
  max-width: ${responsive.containerMaxWidth ?? canvas.grid.maxWidth ?? "72rem"};
  padding: var(--wb-tpl-margin);
}

.wb-tpl-layout {
  display: grid;
  gap: ${blueprint.placementRules.global.defaultOrdering === "vertical" ? canvas.grid.gutter : canvas.grid.gutter};
}

.wb-tpl-layout--sidebar-left {
  grid-template-columns: minmax(12rem, 1fr) minmax(0, 3fr);
}

.wb-tpl-layout--sidebar-right {
  grid-template-columns: minmax(0, 3fr) minmax(12rem, 1fr);
}

.wb-tpl-layout--full-bleed,
.wb-tpl-layout--editorial-reveal {
  grid-template-columns: 1fr;
}

.wb-tpl-region {
  border: 1px dashed var(--wb-tpl-border);
  border-radius: var(--wb-tpl-radius);
}

.wb-tpl-region__slot {
  min-height: 4rem;
  padding: calc(var(--wb-tpl-gutter) * 0.75);
  color: var(--wb-tpl-muted);
  font-size: 0.875rem;
}

.wb-tpl-region--header,
.wb-tpl-region--footer {
  background: rgba(255, 255, 255, 0.02);
}

${breakpointRules}
`;
}

/**
 * Structural renderer — outputs region shells and placement metadata only.
 * No business content (hero, FAQ, pricing, etc.) is hardcoded by the template.
 */
export function renderWbTemplate(
  pkg: WbTemplatePackage,
  context: WbTemplateRenderContext = {},
): WbTemplateRenderResult {
  const blueprint = resolvePackageBlueprint(pkg, context.pageId);
  const manifest = pkg.manifest;
  const layoutClass = `wb-tpl-layout wb-tpl-layout--${blueprint.layoutKind}`;

  const placementMeta: Record<string, WbTemplateRegionPlacementRules> = {};
  for (const region of blueprint.regions) {
    placementMeta[region.id] = region.placement;
  }

  const bodyHtml = `<div class="wb-tpl" data-template-id="${escapeHtml(manifest.id)}" data-template-version="${escapeHtml(manifest.version)}" data-page-id="${escapeHtml(blueprint.pageId)}" data-layout-id="${escapeHtml(blueprint.layoutId)}" data-placement-rules="${escapeJson(placementMeta)}">
  <div class="wb-tpl-canvas ${layoutClass}" data-layout="${escapeHtml(blueprint.layoutKind)}">
    ${blueprint.regions.map(renderRegion).join("\n    ")}
  </div>
</div>`;

  return {
    bodyHtml,
    styleCss: buildWbTemplateRenderStyles(blueprint, blueprint.responsive),
    meta: {
      templateId: manifest.id,
      version: manifest.version,
      pageId: blueprint.pageId,
      layout: blueprint.layoutKind,
      regionIds: blueprint.regionOrder,
    },
  };
}
