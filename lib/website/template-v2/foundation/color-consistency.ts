/** Light flagship packages — softer glows, no dark featured-card gradients. */
const LIGHT_FLAGSHIP_PACKAGES = [
  "saas-enterprise",
  "corporate-business",
  "finance-premium",
  "education-premium",
  "medical-premium",
  "real-estate-premium",
  "ecommerce-premium",
  "prism-aurora",
  "forge-industrial",
  "lumina-wellness",
  "hotel-resort-premium",
] as const;

const SECTION_GLOW_PREFIXES = [
  "df",
  "se",
  "cb",
  "ec",
  "mp",
  "fn",
  "ed",
  "hr",
  "rep",
  "pr",
  "fg",
  "lu",
] as const;

export function buildFoundationColorConsistencyCss(): string {
  const lightGlowRules = LIGHT_FLAGSHIP_PACKAGES.flatMap((pkg) =>
    SECTION_GLOW_PREFIXES.map(
      (prefix) =>
        `[data-v2-package="${pkg}"] .${prefix}-section-glow::before`,
    ),
  ).join(",\n");

  const lightFeaturedRules = LIGHT_FLAGSHIP_PACKAGES.map(
    (pkg) => `[data-v2-package="${pkg}"] .df-card-featured,
[data-v2-package="${pkg}"] .se-card-featured,
[data-v2-package="${pkg}"] .cb-card-featured,
[data-v2-package="${pkg}"] .fn-card-featured,
[data-v2-package="${pkg}"] .mp-card-featured,
[data-v2-package="${pkg}"] .ed-card-featured,
[data-v2-package="${pkg}"] .ec-card-featured,
[data-v2-package="${pkg}"] .rep-card-featured,
[data-v2-package="${pkg}"] .pr-card-featured,
[data-v2-package="${pkg}"] .fg-card-featured,
[data-v2-package="${pkg}"] .lu-card-featured`,
  ).join(",\n");

  return `
/* Design Foundation — per-package color consistency */
${lightGlowRules} {
  background: radial-gradient(
    ellipse 78% 52% at 18% 0%,
    color-mix(in srgb, var(--color-accent, var(--color-signal)) 6%, transparent),
    transparent 68%
  );
}

${lightFeaturedRules} {
  background: var(--color-surface-elevated, var(--color-surface));
  color: var(--color-foreground);
  border-color: color-mix(in srgb, var(--color-accent, var(--color-signal)) 32%, var(--border-subtle, transparent));
  box-shadow: var(--shadow-card, var(--shadow-surface));
}

[data-v2-package="hotel-resort-premium"] .df-section-glow::before,
[data-v2-package="hotel-resort-premium"] .hr-section-glow::before {
  display: none;
}
`.trim();
}
