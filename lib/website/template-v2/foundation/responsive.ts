import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Foundation responsive behavior — augments v2-layout-* shells for all templates.
 */
export function buildFoundationResponsiveCss(
  rules: Pick<TemplateV2ResponsiveRules, "breakpoints" | "containerMaxWidth">,
): string {
  const mdWidth =
    rules.breakpoints.find((bp) => bp.name === "md")?.minWidth ?? 768;
  const lgWidth =
    rules.breakpoints.find((bp) => bp.name === "lg")?.minWidth ?? 1024;

  return `
/* Design Foundation — responsive */
.v2-template .df-container {
  max-width: var(--container-max, ${rules.containerMaxWidth ?? "82rem"});
}

@media (max-width: ${mdWidth - 1}px) {
  .v2-template .df-nav {
    flex-wrap: wrap;
    min-height: auto;
    padding-block: 0.75rem;
  }
  .v2-template .df-footer-grid {
    grid-template-columns: 1fr;
  }
  .v2-template .df-grid-12 {
    grid-template-columns: 1fr;
  }
  .v2-template .df-headline {
    font-size: clamp(2rem, 8vw, 2.75rem);
  }
  .v2-template .df-btn-primary,
  .v2-template .df-btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (min-width: ${mdWidth}px) {
  .v2-template .df-grid-12[data-cols="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .v2-template .df-grid-12[data-cols="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: ${lgWidth}px) {
  .v2-template .df-grid-12[data-cols="4"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .v2-template [data-v2-region="overlay"] {
    padding-inline: var(--df-container-padding);
  }
}

@media (max-width: ${lgWidth - 1}px) {
  .v2-template [data-v2-region="header"] {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--color-background) 88%, transparent);
  }
}
`.trim();
}
