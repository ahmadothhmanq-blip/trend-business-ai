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

  const textXl = scaleFromTokens(tokens, "xl", "1.625rem");

  const textDisplay = scaleFromTokens(

    tokens,

    "display",

    "clamp(1.875rem, 3vw, 2.5rem)",

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

    `  --df-text-2xl: clamp(1.3125rem, 2vw, 1.75rem);`,

    `  --df-text-3xl: clamp(1.5rem, 2.4vw, 2rem);`,

    `  --df-text-caption: 0.6875rem;`,

    `  --df-text-label: 0.75rem;`,

    `  --df-text-display: ${textDisplay};`,

    `  --df-leading-tight: 1.1;`,

    `  --df-leading-display: 1.1;`,

    `  --df-leading-stacked: 1.05;`,

    `  --df-leading-snug: 1.32;`,

    `  --df-leading-normal: 1.65;`,

    `  --df-leading-relaxed: 1.72;`,

    `  --df-stack-word-gap: 0.06em;`,

    `  --df-tracking-tight: -0.028em;`,

    `  --df-tracking-wide: 0.1em;`,

    `  --df-tracking-wider: 0.2em;`,

    `  --df-radius-sm: 6px;`,

    `  --df-radius-md: 10px;`,

    `  --df-radius-lg: 16px;`,

    `  --df-radius-xl: 24px;`,

    `  --df-radius-pill: 9999px;`,

    `  --df-grid-columns: 12;`,

    `  --df-grid-gutter: clamp(1.125rem, 2.8vw, 2rem);`,

    `  --df-container-padding: clamp(1.25rem, 4.2vw, 2.75rem);`,

    `  --df-section-y: clamp(4.25rem, 9vw, 7rem);`,

    `  --df-section-y-tight: clamp(3.25rem, 6.5vw, 5rem);`,

    `  --cb-section-y: clamp(4.5rem, 9.5vw, 7.25rem);`,

    `  --se-section-y: clamp(3.75rem, 8.5vw, 6rem);`,
    `  --as-section-y: clamp(4.5rem, 12vw, 7.5rem);`,

    `  --ed-section-y: clamp(5.25rem, 11.5vw, 8rem);`,

    `  --fn-section-y: clamp(5.25rem, 11.5vw, 8rem);`,

    `  --mp-section-y: clamp(4.75rem, 11.5vw, 7.25rem);`,

    `  --sv-section-y: clamp(4.75rem, 13.5vw, 8.5rem);`,

    `  --ec-section-y: clamp(4.25rem, 8.5vw, 6.75rem);`,

    `  --rp-section-y: clamp(5.25rem, 12.5vw, 8.5rem);`,

    `  --hr-section-y: clamp(5.25rem, 12.5vw, 8.5rem);`,

    `  --rep-section-y: clamp(5.75rem, 12.5vw, 8.75rem);`,

    `  --df-stack-gap: clamp(1rem, 2.4vw, 1.625rem);`,

    `  --df-shadow-ambient: 0 1px 2px color-mix(in srgb, var(--color-foreground) 4%, transparent);`,

    `  --df-shadow-card: 0 10px 36px color-mix(in srgb, var(--color-foreground) 5%, transparent), 0 2px 8px color-mix(in srgb, var(--color-foreground) 3%, transparent);`,

    `  --df-shadow-elevated: 0 28px 72px color-mix(in srgb, var(--color-foreground) 8%, transparent), 0 8px 24px color-mix(in srgb, var(--color-foreground) 4%, transparent);`,

    `  --df-shadow-inset: inset 0 1px 0 color-mix(in srgb, #fff 22%, transparent);`,

    `  --df-motion-fast: 180ms;`,

    `  --df-motion-base: 380ms;`,

    `  --df-motion-slow: 640ms;`,

    `  --df-motion-ease: cubic-bezier(0.22, 1, 0.36, 1);`,

    `  --df-motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);`,

    `  --df-focus-width: 2px;`,

    `  --df-focus-offset: 3px;`,

    `  --df-focus-color: color-mix(in srgb, var(--color-accent, var(--color-signal)) 72%, transparent);`,

    `  --df-border-width: 1px;`,

    `  --df-nav-height: 4.5rem;`,

    `  --df-footer-gap: clamp(2.25rem, 5.5vw, 3.75rem);`,

    "}",

  ].join("\n");

}


