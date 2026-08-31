import type { VisualSkin } from "@/lib/website/visual-skin/types";

function fontQuery(display: string, body: string): string {
  const families = new Set([display, body].map((f) => f.replace(/ /g, "+")));
  return [...families]
    .map((f) => `family=${f}:wght@400;500;600;700`)
    .join("&");
}

/** Per-skin layout tokens + section/hero rules — not just colors. */
export function buildVisualSkinLayoutCss(skin: VisualSkin): string {
  const presets: Record<
    string,
    {
      vars: Record<string, string>;
      rules: string;
    }
  > = {
    sovereign: {
      vars: {
        "container-max": "82rem",
        "section-y": "5.5rem",
        "section-y-mobile": "3.5rem",
        "df-headline-tracking": "-0.04em",
        "df-text-display": "clamp(2.5rem, 5vw, 4.25rem)",
        "df-radius-lg": "0.875rem",
        "df-shadow-card": skin.shadows.md,
        "df-shadow-elevated": skin.shadows.lg,
      },
      rules: `
html[data-tb-skin="sovereign"] section[data-v2-section-rhythm],
html[data-tb-skin="sovereign"] .df-section {
  padding-block: clamp(3.5rem, 8vw, 5.5rem);
}
html[data-tb-skin="sovereign"] .df-hero-split-empty-section,
html[data-tb-skin="sovereign"] [data-v2-section-rhythm="hero"] {
  min-height: min(92svh, 56rem);
}
html[data-tb-skin="sovereign"] h1,
html[data-tb-skin="sovereign"] .df-headline {
  font-weight: 700;
  letter-spacing: -0.04em;
}
html[data-tb-skin="sovereign"] .se-card,
html[data-tb-skin="sovereign"] article {
  border-radius: 0.875rem;
  border: 1px solid color-mix(in srgb, var(--color-accent) 16%, transparent);
  backdrop-filter: blur(12px);
}`,
    },
    apex: {
      vars: {
        "container-max": "76rem",
        "section-y": "5.5rem",
        "section-y-mobile": "3.5rem",
        "df-headline-tracking": "-0.04em",
        "df-text-display": "clamp(2.5rem, 5vw, 4rem)",
        "df-radius-lg": "0.75rem",
        "df-shadow-card": skin.shadows.md,
        "df-shadow-elevated": skin.shadows.lg,
      },
      rules: `
html[data-tb-skin="apex"] section[data-v2-section-rhythm],
html[data-tb-skin="apex"] .df-section {
  padding-block: clamp(3.5rem, 8vw, 5.5rem);
}
html[data-tb-skin="apex"] .df-hero-split-empty-section,
html[data-tb-skin="apex"] [data-v2-section-rhythm="hero"] {
  min-height: min(88svh, 52rem);
}
html[data-tb-skin="apex"] .df-headline,
html[data-tb-skin="apex"] h1 {
  font-weight: 700;
  letter-spacing: -0.04em;
}
html[data-tb-skin="apex"] .se-card,
html[data-tb-skin="apex"] [class*="card"] {
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
}`,
    },
    signal: {
      vars: {
        "container-max": "60rem",
        "section-y": "8rem",
        "section-y-mobile": "5rem",
        "df-headline-tracking": "-0.02em",
        "df-text-display": "clamp(2.25rem, 4vw, 3.25rem)",
        "df-radius-lg": "1rem",
        "df-shadow-card": skin.shadows.sm,
      },
      rules: `
html[data-tb-skin="signal"] section[data-v2-section-rhythm],
html[data-tb-skin="signal"] .df-section {
  padding-block: clamp(5rem, 10vw, 8rem);
}
html[data-tb-skin="signal"] h1, html[data-tb-skin="signal"] .df-headline {
  font-weight: 600;
  max-width: 18ch;
}
html[data-tb-skin="signal"] .as-card, html[data-tb-skin="signal"] article {
  box-shadow: none;
  border: 1px solid color-mix(in srgb, var(--color-accent) 14%, transparent);
  backdrop-filter: blur(12px);
}`,
    },
    volt: {
      vars: {
        "container-max": "88rem",
        "section-y": "7rem",
        "section-y-mobile": "4.5rem",
        "df-headline-tracking": "-0.05em",
        "df-text-display": "clamp(2.25rem, 6vw, 4.5rem)",
        "df-radius-lg": "0",
        "df-shadow-card": skin.shadows.sm,
        "df-shadow-elevated": skin.shadows.lg,
      },
      rules: `
html[data-tb-skin="volt"] section[data-v2-section-rhythm],
html[data-tb-skin="volt"] .df-section {
  padding-block: clamp(4.5rem, 10vw, 7rem);
}
html[data-tb-skin="volt"] [data-v2-section-rhythm="hero"] {
  min-height: min(90svh, 54rem);
}
html[data-tb-skin="volt"] h1, html[data-tb-skin="volt"] .df-headline {
  font-weight: 700;
  letter-spacing: -0.05em;
  text-transform: none;
}
html[data-tb-skin="volt"] .sv-card, html[data-tb-skin="volt"] article {
  border-radius: 0;
  border: 1px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
}`,
    },
    horizon: {
      vars: {
        "container-max": "72rem",
        "section-y": "6rem",
        "df-radius-lg": "1.25rem",
        "df-shadow-card": skin.shadows.md,
      },
      rules: `
html[data-tb-skin="horizon"] [data-v2-section-rhythm="hero"] {
  border-radius: 1.25rem;
  margin-inline: 1rem;
  overflow: hidden;
}
html[data-tb-skin="horizon"] .se-card, html[data-tb-skin="horizon"] article {
  border-radius: 1.25rem;
}`,
    },
    prestige: {
      vars: {
        "container-max": "74rem",
        "section-y": "6rem",
        "section-y-mobile": "4rem",
        "df-headline-tracking": "-0.03em",
        "df-text-display": "clamp(2.5rem, 5vw, 4rem)",
        "df-radius-lg": "1rem",
        "df-shadow-card": skin.shadows.md,
        "df-shadow-elevated": skin.shadows.lg,
      },
      rules: `
html[data-tb-skin="prestige"] section[data-v2-section-rhythm],
html[data-tb-skin="prestige"] .df-section {
  padding-block: clamp(4rem, 9vw, 6rem);
}
html[data-tb-skin="prestige"] [data-v2-section-rhythm="hero"],
html[data-tb-skin="prestige"] .df-hero-split-empty-section {
  min-height: min(88svh, 52rem);
}
html[data-tb-skin="prestige"] h1,
html[data-tb-skin="prestige"] .df-headline {
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}
html[data-tb-skin="prestige"] .se-card,
html[data-tb-skin="prestige"] article {
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 8%, transparent);
  box-shadow: var(--df-shadow-card);
}`,
    },
    vault: {
      vars: {
        "container-max": "80rem",
        "section-y": "6.5rem",
        "df-headline-tracking": "-0.02em",
        "df-text-display": "clamp(2.5rem, 4.8vw, 4.25rem)",
        "df-radius-lg": "0.25rem",
        "df-shadow-card": skin.shadows.md,
        "df-accent-glow": "color-mix(in srgb, var(--color-primary) 22%, transparent)",
      },
      rules: `
html[data-tb-skin="vault"] section[data-v2-section-rhythm] {
  border-top: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
}
html[data-tb-skin="vault"] .df-hero-estate-empty-section {
  min-height: min(95svh, 58rem);
}
html[data-tb-skin="vault"] h1, html[data-tb-skin="vault"] .df-headline {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
}`,
    },
    pulse: {
      vars: {
        "container-max": "78rem",
        "section-y": "5rem",
        "df-radius-lg": "1.5rem",
        "df-shadow-card": skin.shadows.md,
        "df-accent-glow": "color-mix(in srgb, var(--color-accent) 28%, transparent)",
      },
      rules: `
html[data-tb-skin="pulse"] section[data-v2-section-rhythm] {
  position: relative;
  isolation: isolate;
}
html[data-tb-skin="pulse"] section[data-v2-section-rhythm]::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 70% 50% at 80% 0%, var(--df-accent-glow), transparent 65%);
  opacity: 0.9;
}
html[data-tb-skin="pulse"] .df-hero-bleed-empty-section {
  min-height: min(90svh, 54rem);
}
html[data-tb-skin="pulse"] h1 { font-weight: 800; }`,
    },
    clarity: {
      vars: {
        "container-max": "68rem",
        "section-y": "5.5rem",
        "df-radius-lg": "0.875rem",
        "df-shadow-card": skin.shadows.sm,
      },
      rules: `
html[data-tb-skin="clarity"] section[data-v2-section-rhythm] header {
  text-align: center;
  margin-inline: auto;
  max-width: 40rem;
}
html[data-tb-skin="clarity"] .se-card, html[data-tb-skin="clarity"] article {
  padding: 1.25rem;
}`,
    },
  };

  const preset = presets[skin.id] ?? presets.signal ?? presets.sovereign ?? presets.apex!;
  const varLines = Object.entries(preset.vars)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n");

  const fonts = fontQuery(skin.typography.headingFont, skin.typography.bodyFont);

  return `
@import url("https://fonts.googleapis.com/css2?${fonts}&display=swap");
html[data-tb-skin="${skin.id}"] {
${varLines}
}
body {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  background: var(--color-background);
  color: var(--color-foreground);
}
h1, h2, h3, h4, .df-headline, .df-headline-sm, .se-headline, .se-headline-sm {
  font-family: var(--font-display), var(--font-heading), ui-sans-serif, system-ui, sans-serif;
  color: var(--color-foreground);
}
p, li, .df-body, .se-body {
  color: color-mix(in srgb, var(--color-foreground) 82%, transparent);
}
${preset.rules}
`;
}
