/**
 * Global RTL typography and directional overrides for all V2 templates.
 */
export function buildFoundationRtlCss(): string {
  return `
/* Design Foundation — RTL & Arabic typography */
[dir="rtl"] .v2-template,
[dir="rtl"] .v2-template * {
  letter-spacing: 0.01em;
}

[dir="rtl"] .v2-template {
  line-height: 1.75;
}

[dir="rtl"] .df-eyebrow {
  letter-spacing: 0.06em;
}

[dir="rtl"] .df-headline,
[dir="rtl"] .df-headline-sm,
[dir="rtl"] [class*="-headline"],
[dir="rtl"] [class*="-display"] {
  line-height: 1.28;
  letter-spacing: 0;
  text-wrap: pretty;
  overflow-wrap: anywhere;
  text-transform: none;
}

[dir="rtl"] [class*="-display"] > span,
[dir="rtl"] .df-headline-stack > * {
  line-height: 1.22;
  padding-block: 0.08em;
}

[dir="rtl"] .df-body,
[dir="rtl"] .df-prose {
  line-height: 1.85;
  max-width: 42rem;
}

[dir="rtl"] .df-container,
[dir="rtl"] .df-stack,
[dir="rtl"] .df-card,
[dir="rtl"] section {
  text-align: start;
}

[dir="rtl"] .text-center {
  text-align: center;
}

[dir="rtl"] .df-accent-line,
[dir="rtl"] [class*="-rule"],
[dir="rtl"] [class*="-accent-line"],
[dir="rtl"] [class*="-gold-rule"],
[dir="rtl"] [class*="-sage-rule"],
[dir="rtl"] [class*="-volt-line"],
[dir="rtl"] [class*="-brass-rule"],
[dir="rtl"] [class*="-copper-rule"],
[dir="rtl"] [class*="-azure-rule"] {
  transform-origin: inline-end;
}

[dir="rtl"] [class*="marquee-track"] {
  animation-direction: reverse;
}

[dir="rtl"] .df-hero-scrim {
  background: linear-gradient(
    to inline-start,
    color-mix(in srgb, var(--color-primary) 90%, transparent) 0%,
    color-mix(in srgb, var(--color-primary) 70%, transparent) 45%,
    transparent 100%
  );
}

[dir="rtl"] .v2-sidebar-shell {
  flex-direction: row-reverse;
}
`.trim();
}
