import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

export function buildV2ResponsiveCss(rules: TemplateV2ResponsiveRules): string {
  const lines = [
    "/* Template Architecture V2 — responsive rules */",
    ".v2-region-grid {",
    "  width: 100%;",
    `  max-width: ${rules.containerMaxWidth ?? "78rem"};`,
    "  margin-inline: auto;",
    "}",
  ];

  for (const bp of rules.breakpoints) {
    lines.push(
      `@media (min-width: ${bp.minWidth}px) {`,
      `  .v2-region-grid[data-breakpoint="${bp.name}"] { --v2-bp: ${bp.name}; }`,
      "}",
    );
  }

  if (rules.regions) {
    for (const [regionId, regionRules] of Object.entries(rules.regions)) {
      if (regionRules.sticky) {
        lines.push(`[data-v2-region="${regionId}"] { position: sticky; top: 0; z-index: 40; }`);
      }
      if (regionRules.collapseBelow) {
        lines.push(
          `@media (max-width: ${resolveCollapseWidth(rules, regionRules.collapseBelow)}px) {`,
          `  [data-v2-region="${regionId}"] { display: block; }`,
          "}",
        );
      }
    }
  }

  lines.push(
    "",
    "/* V2 sidebar-left layout */",
    ".v2-layout-sidebar-left .v2-sidebar-shell { gap: 0; align-items: flex-start; }",
    ".v2-sidebar-rail {",
    "  border-inline-end: 1px solid var(--border-subtle, rgba(244,237,228,0.06));",
    "  padding-block: clamp(2rem, 5vw, 3.5rem);",
    "  padding-inline-end: clamp(1.25rem, 3vw, 2rem);",
    "}",
    "[dir='rtl'] .v2-sidebar-rail { border-inline-end: none; border-inline-start: 1px solid var(--border-subtle, rgba(244,237,228,0.06)); }",
    ".v2-main-canvas > [data-v2-component] + [data-v2-component] { margin-top: 0; }",
    ".v2-layout-sidebar-left .v2-main-canvas { padding-inline-start: 0; }",
    "@media (max-width: 1023px) {",
    "  .v2-sidebar-rail { display: none !important; }",
    "}",
    "",
    "/* V2 sidebar-right layout */",
    ".v2-layout-sidebar-right .v2-sidebar-shell { gap: 0; align-items: flex-start; }",
    ".v2-layout-sidebar-right .v2-sidebar-rail {",
    "  border-inline-start: 1px solid var(--border-subtle, rgba(28,25,23,0.06));",
    "  border-inline-end: none;",
    "  padding-block: clamp(2rem, 5vw, 3.5rem);",
    "  padding-inline-start: clamp(1.25rem, 3vw, 2rem);",
    "}",
    "[dir='rtl'] .v2-layout-sidebar-right .v2-sidebar-rail {",
    "  border-inline-start: none;",
    "  border-inline-end: 1px solid var(--border-subtle, rgba(28,25,23,0.06));",
    "}",
    "",
    "/* V2 full-bleed layout */",
    ".v2-layout-full-bleed .v2-overlay-canvas { width: 100%; }",
    ".v2-layout-full-bleed .v2-main-canvas { width: 100%; max-width: var(--container-max, 76rem); margin-inline: auto; }",
    "",
    "/* V2 editorial-reveal layout (creative portfolio) */",
    ".v2-layout-editorial-reveal .v2-main-canvas { width: 100%; }",
    ".v2-layout-editorial-reveal .v2-overlay-reveal { width: 100%; }",
  );

  return lines.join("\n");
}

function resolveCollapseWidth(
  rules: TemplateV2ResponsiveRules,
  collapseBelow: string,
): number {
  const match = rules.breakpoints.find((bp) => bp.name === collapseBelow);
  return match ? match.minWidth - 1 : 767;
}
