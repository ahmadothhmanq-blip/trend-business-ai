import type { FoundationUi } from "@/lib/website/template-v2/foundation/types";

/** Canonical foundation class map for shared flagship components. */
export const FOUNDATION_UI: FoundationUi = {
  section: "df-section",
  sectionAlt: "df-section-alt",
  sectionGlow: "df-section-glow",
  container: "df-container",
  eyebrow: "df-eyebrow",
  headline: "df-headline",
  headlineSm: "df-headline-sm",
  body: "df-body",
  btnPrimary: "df-btn-primary",
  btnSecondary: "df-btn-secondary",
  card: "df-card",
  cardFeatured: "df-card-featured",
  metric: "df-metric",
  focusRing: "df-focus-ring",
  fontDisplay: "df-font-display",
  fontBody: "df-font-body",
  input: "df-input",
  textarea: "df-textarea",
  glowOrb: "df-glow-orb",
  quoteMark: "df-quote-mark",
  star: "df-star",
};

/**
 * Backward-compatible aliases — existing per-template classes inherit foundation rules.
 * Templates keep their prefix; foundation improvements cascade automatically.
 */
export function buildFoundationCompatCss(): string {
  const groups: Array<{ selectors: string[]; rules: string }> = [
    {
      selectors: [
        "df-section-glow",
        "se-section-glow",
        "cb-section-glow",
        "ec-section-glow",
        "mp-section-glow",
        "fn-section-glow",
        "ed-section-glow",
        "hr-section-glow",
        "rep-section-glow",
        "sv-section-glow",
        "cp-section-glow",
        "rs-section-glow",
        "rp-section-glow",
      ],
      rules: "position: relative; overflow: hidden;",
    },
    {
      selectors: [
        "df-glow-orb",
        "se-glow-orb",
        "ec-glow-orb",
        "cb-glow-orb",
      ],
      rules:
        "pointer-events: none; position: absolute; border-radius: 9999px; filter: blur(64px); opacity: 0.35;",
    },
    {
      selectors: [
        "df-section-alt",
        "se-section-alt",
        "ec-section-alt",
        "cb-section-alt",
        "mp-section-alt",
        "fn-section-alt",
        "ed-section-alt",
        "hr-section-alt",
        "rep-section-alt",
        "sv-section-alt",
        "cp-section-alt",
        "rs-section-alt",
        "rp-section-alt",
      ],
      rules: "background: var(--color-surface, #fff);",
    },
    {
      selectors: [
        "df-card-featured",
        "se-card-featured",
        "cb-card-featured",
        "ec-card-featured",
      ],
      rules: `
        border-color: color-mix(in srgb, var(--color-signal, var(--color-accent)) 28%, var(--border-subtle, transparent));
        background: linear-gradient(155deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 88%, var(--color-secondary, var(--color-primary))) 100%);
        color: #fff;
        box-shadow: var(--shadow-surface);
      `.trim(),
    },
    {
      selectors: [
        "df-quote-mark",
        "se-quote-mark",
        "ec-quote-mark",
        "cb-quote-mark",
        "fn-quote-mark",
      ],
      rules: `
        font-family: var(--font-display), ui-serif, Georgia, serif;
        font-size: 3.5rem;
        line-height: 1;
        color: color-mix(in srgb, var(--color-signal, var(--color-accent)) 28%, transparent);
      `.trim(),
    },
    {
      selectors: ["df-star", "se-star", "ec-star", "fn-star"],
      rules: "color: var(--color-signal, var(--color-accent)); letter-spacing: 0.1em;",
    },
    {
      selectors: [
        "df-input",
        "se-input",
        "ec-input",
        "cb-input",
        "fn-input",
        "mp-input",
        "ed-input",
        "hr-input",
        "rep-input",
        "sv-input",
        "cp-input",
        "rs-input",
        "rp-input",
      ],
      rules: `
        width: 100%;
        border-radius: var(--radius-md, 8px);
        border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
        background: var(--color-surface, var(--color-background));
        padding: 0.75rem 1rem;
        font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
        font-size: var(--df-text-sm, 0.875rem);
        color: var(--color-foreground);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      `.trim(),
    },
    {
      selectors: [
        "df-textarea",
        "se-textarea",
        "ec-textarea",
        "cb-textarea",
        "fn-textarea",
        "mp-textarea",
      ],
      rules: `
        width: 100%;
        min-height: 7rem;
        resize: vertical;
        border-radius: var(--radius-md, 8px);
        border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
        background: var(--color-surface, var(--color-background));
        padding: 0.75rem 1rem;
        font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
        font-size: var(--df-text-sm, 0.875rem);
        color: var(--color-foreground);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      `.trim(),
    },
    {
      selectors: [
        "df-container",
        "cb-container",
      ],
      rules: `
        margin-inline: auto;
        width: 100%;
        max-width: var(--container-max, 82rem);
        padding-inline: var(--df-container-padding, clamp(1.25rem, 4vw, 2.5rem));
      `.trim(),
    },
  ];

  const lines = ["/* Design Foundation — backward-compatible aliases */"];

  for (const group of groups) {
    const selectorList = group.selectors
      .map((s) => (s.startsWith(".") ? s : `.${s}`))
      .join(",\n");
    lines.push(`${selectorList} {`, group.rules, "}");
  }

  lines.push(
    "",
    ".df-section-glow::before,",
    ".se-section-glow::before,",
    ".cb-section-glow::before,",
    ".ec-section-glow::before,",
    ".mp-section-glow::before,",
    ".fn-section-glow::before,",
    ".ed-section-glow::before,",
    ".hr-section-glow::before,",
    ".rep-section-glow::before,",
    ".sv-section-glow::before,",
    ".cp-section-glow::before,",
    ".rs-section-glow::before,",
    ".rp-section-glow::before {",
    "  content: \"\";",
    "  pointer-events: none;",
    "  position: absolute;",
    "  inset: 0;",
    "  background:",
    "    radial-gradient(ellipse 70% 55% at 15% 0%, color-mix(in srgb, var(--color-accent, var(--color-signal)) 8%, transparent), transparent 60%),",
    "    radial-gradient(ellipse 55% 45% at 90% 100%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 55%);",
    "}",
  );

  lines.push(
    "",
    ".df-input:focus-visible, .se-input:focus-visible, .ec-input:focus-visible, .cb-input:focus-visible, .fn-input:focus-visible,",
    ".df-textarea:focus-visible, .se-textarea:focus-visible, .ec-textarea:focus-visible, .cb-textarea:focus-visible, .fn-textarea:focus-visible {",
    "  outline: none;",
    "  border-color: var(--color-signal, var(--color-accent));",
    "  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-signal, var(--color-accent)) 14%, transparent);",
    "}",
    "",
    "@keyframes df-slide-up {",
    "  from { opacity: 0; transform: translateY(12px); }",
    "  to { opacity: 1; transform: translateY(0); }",
    "}",
    "@keyframes se-slide-up {",
    "  from { opacity: 0; transform: translateY(12px); }",
    "  to { opacity: 1; transform: translateY(0); }",
    "}",
  );

  return lines.join("\n");
}
