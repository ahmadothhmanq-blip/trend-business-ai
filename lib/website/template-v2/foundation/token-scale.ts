import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";

function scaleFromTokens(
  tokens: TemplateV2DesignTokens,
  key: string,
  fallback: string,
): string {
  return tokens.typography.scale?.[key] ?? fallback;
}

/**
 * Extended CSS custom properties consumed by df-* primitives and all template prefixes.
 */
export function buildFoundationTokenScaleCss(tokens: TemplateV2DesignTokens): string {
  const unit = tokens.spacing?.unit ?? "0.25rem";
  const scale = tokens.spacing?.scale ?? [
    "0",
    "1",
    "2",
    "3",
    "4",
    "6",
    "8",
    "12",
    "16",
    "20",
    "24",
    "32",
    "40",
    "48",
    "64",
  ];

  const spacingLines = scale.map((mult, i) => {
    const value =
      mult === "0"
        ? "0"
        : mult.includes("rem") || mult.includes("px")
          ? mult
          : `calc(${unit} * ${mult})`;
    return `  --df-space-${i}: ${value};`;
  });

  const textSm = scaleFromTokens(tokens, "sm", "0.875rem");
  const textBase = scaleFromTokens(tokens, "base", "1rem");
  const textLg = scaleFromTokens(tokens, "lg", "1.125rem");
  const textXl = scaleFromTokens(tokens, "xl", "2.25rem");
  const textDisplay = scaleFromTokens(
    tokens,
    "display",
    "clamp(2.5rem, 5.5vw, 4.25rem)",
  );

  return [
    "/* Design Foundation — token scale */",
    ":root {",
    ...spacingLines,
    `  --df-text-xs: 0.75rem;`,
    `  --df-text-sm: ${textSm};`,
    `  --df-text-base: ${textBase};`,
    `  --df-text-lg: ${textLg};`,
    `  --df-text-xl: ${textXl};`,
    `  --df-text-display: ${textDisplay};`,
    `  --df-leading-tight: 1.08;`,
    `  --df-leading-snug: 1.35;`,
    `  --df-leading-normal: 1.6;`,
    `  --df-leading-relaxed: 1.75;`,
    `  --df-tracking-tight: -0.025em;`,
    `  --df-tracking-wide: 0.12em;`,
    `  --df-tracking-wider: 0.22em;`,
    `  --df-grid-columns: 12;`,
    `  --df-grid-gutter: clamp(1rem, 3vw, 2rem);`,
    `  --df-container-padding: clamp(1.25rem, 4vw, 2.5rem);`,
    `  --df-section-y: clamp(5.5rem, 12vw, 9rem);`,
    `  --df-section-y-tight: clamp(4rem, 8vw, 6.5rem);`,
    `  --df-stack-gap: clamp(1rem, 2.5vw, 1.5rem);`,
    `  --df-motion-fast: 200ms;`,
    `  --df-motion-base: 420ms;`,
    `  --df-motion-slow: 680ms;`,
    `  --df-motion-ease: cubic-bezier(0.22, 1, 0.36, 1);`,
    `  --df-motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);`,
    `  --df-focus-width: 2px;`,
    `  --df-focus-offset: 3px;`,
    `  --df-focus-color: color-mix(in srgb, var(--color-accent, var(--color-signal)) 75%, transparent);`,
    `  --df-border-width: 1px;`,
    `  --df-nav-height: 4.5rem;`,
    `  --df-footer-gap: clamp(2rem, 5vw, 3.5rem);`,
    "}",
  ].join("\n");
}
