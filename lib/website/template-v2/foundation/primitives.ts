/**
 * Token-driven df-* primitives — shared visual system for all V2 flagship templates.
 */
export function buildFoundationPrimitivesCss(): string {
  return `
/* Design Foundation — primitives */
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

.v2-template {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-base);
  line-height: var(--df-leading-normal);
  color: var(--color-foreground);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v2-template section[id],
.v2-template [data-v2-region="main"] {
  scroll-margin-top: 5.5rem;
}

.df-skip-link {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.df-skip-link:focus {
  position: fixed;
  top: 0.75rem;
  inset-inline-start: 0.75rem;
  z-index: 100;
  width: auto;
  height: auto;
  margin: 0;
  padding: 0.75rem 1.25rem;
  clip: auto;
  overflow: visible;
  white-space: normal;
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  color: var(--color-foreground);
  background: var(--color-surface-elevated, var(--color-surface));
  border: var(--df-border-width) solid var(--df-border-default, var(--border-default));
  border-radius: var(--radius-md, var(--df-radius-md, 10px));
  box-shadow: var(--shadow-surface, var(--df-shadow-elevated));
}

/* Typography */
.df-font-display { font-family: var(--font-display), ui-serif, Georgia, serif; }
.df-font-body { font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif; }
.df-eyebrow {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-xs);
  font-weight: 500;
  letter-spacing: var(--df-tracking-wider);
  text-transform: uppercase;
  color: var(--color-signal, var(--color-accent));
}
.df-headline {
  font-family: var(--font-display), ui-serif, Georgia, serif;
  font-size: var(--df-text-display);
  font-weight: 500;
  line-height: var(--df-leading-tight);
  letter-spacing: var(--df-headline-tracking, var(--df-tracking-tight));
  color: var(--color-foreground);
  text-wrap: balance;
}
.df-headline-sm {
  font-family: var(--font-display), ui-serif, Georgia, serif;
  font-size: clamp(1.875rem, 3.5vw, 2.75rem);
  font-weight: 500;
  line-height: var(--df-leading-snug);
  letter-spacing: var(--df-tracking-tight);
  color: var(--color-foreground);
  text-wrap: balance;
}
.df-body {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-lg);
  line-height: var(--df-leading-relaxed);
  color: var(--df-foreground-muted, var(--color-muted, color-mix(in srgb, var(--color-foreground) 58%, transparent)));
  max-width: 38rem;
}
.df-prose {
  font-size: var(--df-text-base);
  line-height: var(--df-leading-relaxed);
  color: var(--color-muted, color-mix(in srgb, var(--color-foreground) 62%, transparent));
  max-width: 36rem;
}
.df-caption {
  font-size: var(--df-text-sm);
  line-height: var(--df-leading-normal);
  color: var(--color-muted, color-mix(in srgb, var(--color-foreground) 55%, transparent));
}

/* Layout — sections, grid, containers */
.df-section { padding-block: var(--df-section-y); }
.df-section-tight { padding-block: var(--df-section-y-tight); }
.df-section-alt {
  background: var(--color-surface-elevated, var(--color-surface, #fff));
}
.df-section-glow {
  position: relative;
  overflow: hidden;
}
.df-section-glow::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 72% 58% at 14% 0%, var(--df-accent-glow, color-mix(in srgb, var(--color-accent, var(--color-signal)) 10%, transparent)), transparent 62%),
    radial-gradient(ellipse 58% 48% at 92% 100%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 58%);
}
.df-container {
  margin-inline: auto;
  width: 100%;
  max-width: var(--container-max, 82rem);
  padding-inline: var(--df-container-padding);
}
.df-container-narrow { max-width: min(var(--container-max, 82rem), 48rem); }
.df-container-wide { max-width: min(calc(var(--container-max, 82rem) + 6rem), 96rem); }
.df-grid-12 {
  display: grid;
  grid-template-columns: repeat(var(--df-grid-columns), minmax(0, 1fr));
  gap: var(--df-grid-gutter);
}
.df-stack { display: flex; flex-direction: column; gap: var(--df-stack-gap); }
.df-divider {
  height: var(--df-border-width);
  width: 100%;
  background: var(--df-border-subtle, var(--border-subtle, color-mix(in srgb, var(--color-foreground) 8%, transparent)));
}

/* Cards */
.df-card {
  border: var(--df-border-width) solid var(--df-border-subtle, var(--border-subtle, color-mix(in srgb, var(--color-foreground) 8%, transparent)));
  background: var(--color-surface-elevated, var(--color-surface, #fff));
  border-radius: var(--radius-lg, var(--df-radius-lg, 16px));
  box-shadow: var(--shadow-card, var(--df-shadow-card));
  transition:
    box-shadow var(--df-motion-base) var(--df-motion-ease),
    transform var(--df-motion-base) var(--df-motion-ease),
    border-color var(--df-motion-fast) ease;
}
.df-card:hover {
  border-color: var(--df-border-accent, var(--border-accent, color-mix(in srgb, var(--color-accent) 28%, transparent)));
  box-shadow: var(--shadow-surface, var(--df-shadow-elevated));
  transform: translateY(-2px);
}
.df-card-featured {
  border-color: color-mix(in srgb, var(--color-signal, var(--color-accent)) 28%, var(--border-subtle, transparent));
  background: linear-gradient(
    155deg,
    var(--color-primary) 0%,
    color-mix(in srgb, var(--color-primary) 88%, var(--color-secondary, var(--color-primary))) 100%
  );
  color: #fff;
  box-shadow: var(--shadow-surface);
}
.df-card-glass {
  background: color-mix(in srgb, var(--color-surface-elevated, var(--color-surface, #fff)) 78%, transparent);
  backdrop-filter: blur(22px) saturate(1.15);
  border: var(--df-border-width) solid color-mix(in srgb, #fff 55%, var(--df-border-subtle, transparent));
  border-radius: var(--radius-lg, var(--df-radius-lg, 16px));
  box-shadow: var(--shadow-card, var(--df-shadow-card));
}
.df-card-interactive { cursor: pointer; }
.df-card-interactive:focus-visible { outline: var(--df-focus-width) solid var(--df-focus-color); outline-offset: var(--df-focus-offset); }

/* Buttons */
.df-btn-primary {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  padding: 0 1.625rem;
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--color-background, #fff);
  background: var(--color-primary);
  border: var(--df-border-width) solid color-mix(in srgb, var(--color-primary) 78%, #000);
  border-radius: var(--df-radius-pill, 9999px);
  box-shadow: var(--shadow-card, var(--df-shadow-card));
  transition:
    transform var(--df-motion-fast) var(--df-motion-ease),
    box-shadow var(--df-motion-base) var(--df-motion-ease),
    filter var(--df-motion-fast) ease;
}
.df-btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 42%, color-mix(in srgb, #fff 22%, transparent) 50%, transparent 58%);
  transform: translateX(-120%);
  transition: transform 0.55s ease;
  pointer-events: none;
}
.df-btn-primary:hover::after {
  transform: translateX(120%);
}
.df-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-surface, var(--df-shadow-elevated));
  filter: brightness(1.05);
}
.df-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  padding: 0 1.625rem;
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--color-foreground);
  background: var(--color-surface-elevated, var(--color-surface, #fff));
  border: var(--df-border-width) solid var(--df-border-default, var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent)));
  border-radius: var(--df-radius-pill, 9999px);
  transition:
    border-color var(--df-motion-fast) ease,
    background var(--df-motion-fast) ease,
    transform var(--df-motion-fast) var(--df-motion-ease);
}
.df-btn-secondary:hover {
  border-color: var(--df-border-accent, color-mix(in srgb, var(--color-foreground) 18%, var(--border-default, transparent)));
  background: var(--color-surface-elevated, color-mix(in srgb, var(--color-surface, #fff) 96%, var(--color-background)));
  transform: translateY(-1px);
}
.df-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  color: var(--color-signal, var(--color-accent));
  text-decoration: none;
  transition: gap var(--df-motion-fast) ease, opacity var(--df-motion-fast) ease;
}
.df-btn-ghost:hover { gap: 0.625rem; opacity: 0.85; }
.df-btn-link {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  color: var(--color-accent, var(--color-signal));
  text-decoration: underline;
  text-underline-offset: 0.2em;
  transition: opacity var(--df-motion-fast) ease;
}
.df-btn-link:hover { opacity: 0.8; }

/* Forms */
.df-label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  color: var(--color-foreground);
}
.df-input,
.df-textarea,
.df-select {
  width: 100%;
  border-radius: var(--radius-md, var(--df-radius-md, 10px));
  border: var(--df-border-width) solid var(--df-border-default, var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent)));
  background: var(--color-surface-elevated, var(--color-surface, var(--color-background)));
  padding: 0.75rem 1rem;
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  color: var(--color-foreground);
  transition:
    border-color var(--df-motion-fast) ease,
    box-shadow var(--df-motion-fast) ease;
}
.df-textarea { min-height: 7rem; resize: vertical; }
.df-input::placeholder,
.df-textarea::placeholder {
  color: color-mix(in srgb, var(--color-muted, var(--color-foreground)) 70%, transparent);
}
.df-input:focus-visible,
.df-textarea:focus-visible,
.df-select:focus-visible {
  outline: none;
  border-color: var(--color-signal, var(--color-accent));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-signal, var(--color-accent)) 14%, transparent);
}
.df-field { display: flex; flex-direction: column; gap: 0.375rem; }
.df-form-group { display: flex; flex-direction: column; gap: var(--df-stack-gap); }

/* Navigation */
.df-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: var(--df-nav-height);
}
.df-nav-link {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-sm);
  font-weight: 500;
  color: color-mix(in srgb, var(--color-foreground) 72%, transparent);
  text-decoration: none;
  transition: color var(--df-motion-fast) ease;
}
.df-nav-link:hover { color: var(--color-foreground); }
.df-nav-link-active {
  color: var(--color-foreground);
  font-weight: 600;
}

/* Footer */
.df-footer {
  padding-block: var(--df-footer-gap);
  border-top: var(--df-border-width) solid var(--df-border-subtle, var(--border-subtle, color-mix(in srgb, var(--color-foreground) 8%, transparent)));
  background: var(--color-surface-inset, var(--color-surface, var(--color-background)));
}
.df-footer-grid {
  display: grid;
  gap: var(--df-stack-gap);
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}
.df-footer-col { display: flex; flex-direction: column; gap: 0.75rem; }
.df-footer-link {
  font-size: var(--df-text-sm);
  color: var(--color-muted, color-mix(in srgb, var(--color-foreground) 58%, transparent));
  text-decoration: none;
  transition: color var(--df-motion-fast) ease;
}
.df-footer-link:hover { color: var(--color-foreground); }

/* Effects & utilities */
.df-focus-ring:focus-visible {
  outline: var(--df-focus-width) solid var(--df-focus-color);
  outline-offset: var(--df-focus-offset);
}
.df-accent-line {
  height: var(--df-border-width);
  width: 3.5rem;
  background: linear-gradient(
    to inline-end,
    var(--color-signal, var(--color-accent)),
    transparent
  );
}

/* Typography-forward hero when image slots are empty — legacy fallback */
.df-hero-editorial {
  margin-inline: auto;
  width: 100%;
  max-width: min(44rem, 100%);
  text-align: center;
}
.df-hero-editorial-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: min(88vh, 52rem);
  padding-block: clamp(4.5rem, 12vh, 8rem);
}
.df-hero-editorial .df-accent-line,
.df-hero-editorial [class*="-rule"],
.df-hero-editorial [class*="-copper-rule"],
.df-hero-editorial [class*="-brass-rule"],
.df-hero-editorial [class*="-azure-rule"],
.df-hero-editorial [class*="-gold-rule"],
.df-hero-editorial [class*="-sage-rule"] {
  margin-inline: auto;
}
.df-hero-editorial .df-body,
.df-hero-editorial [class*="-body"] {
  margin-inline: auto;
}

/* Sector-specific empty-hero profiles */
.df-hero-split-empty-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: min(94vh, 58rem);
  padding-block: clamp(4rem, 10vh, 7rem);
}
.df-hero-split-empty-copy {
  text-align: start;
  max-width: none;
}
@media (min-width: 1024px) {
  .df-hero-split-empty-copy { grid-column: span 5 / span 5; }
  .df-hero-split-empty-visual { grid-column: span 7 / span 7; }
}
.df-hero-split-empty-visual {
  position: relative;
  min-height: clamp(18rem, 42vh, 28rem);
}

.df-hero-bleed-empty-section {
  position: relative;
  min-height: min(100svh, 56rem);
  overflow: hidden;
}
.df-hero-bleed-empty-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 90% 70% at 18% 85%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 58%),
    radial-gradient(ellipse 60% 50% at 82% 18%, color-mix(in srgb, var(--color-accent, var(--color-signal)) 14%, transparent), transparent 52%),
    linear-gradient(168deg, var(--color-background) 0%, color-mix(in srgb, var(--color-surface) 88%, var(--color-background)) 48%, var(--color-background) 100%);
}
.df-hero-bleed-empty-content { text-align: start; }
.df-hero-bleed-empty-copy { text-align: start; }
.df-hero-bleed-empty-copy [class*="-rule"],
.df-hero-bleed-empty-copy [class*="-copper-rule"],
.df-hero-bleed-empty-copy [class*="-brass-rule"],
.df-hero-bleed-empty-copy [class*="-azure-rule"] {
  margin-inline: 0;
}

.df-hero-trust-empty-section {
  min-height: min(88vh, 52rem);
  padding-block: clamp(3.5rem, 8vh, 6rem);
}
.df-hero-trust-empty-copy { text-align: start; max-width: none; }

.df-hero-type-empty-section {
  min-height: min(94vh, 58rem);
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
}
.df-hero-type-empty { text-align: start; }

/* Hero collision guards — fluid/smaller viewports */
[data-v2-component$="-hero"] {
  isolation: isolate;
}
[data-v2-component$="-hero"] h1,
[data-v2-component$="-hero"] [id$="-hero-title"],
[data-v2-component$="-hero"] .df-hero-bleed-empty-copy,
[data-v2-component$="-hero"] [class*="-headline"],
[data-v2-component$="-hero"] [class*="-display"] {
  position: relative;
  z-index: 2;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

/* Typography collision guards — headlines, grids, stacked words */
.v2-template h1,
.v2-template h2,
.v2-template h3,
.v2-template [class*="-headline"],
.v2-template [class*="-display"] {
  overflow-wrap: break-word;
  word-wrap: break-word;
  text-wrap: balance;
  max-width: 100%;
}
.v2-template [class*="-display"] > span,
.v2-template .df-headline-stack > * {
  display: block;
  line-height: var(--df-leading-stacked, 1.05);
  padding-block: var(--df-stack-word-gap, 0.06em);
}
.v2-template [class*="-quote-mark"] {
  display: block;
  line-height: 1;
  height: 0.62em;
  margin-block-end: 0.2em;
  overflow: visible;
}
.v2-template .grid > *,
.v2-template [class*="grid-cols"] > *,
.v2-template .df-grid-12 > * {
  min-width: 0;
}
.v2-template [class*="-metric"],
.v2-template [class*="-stat-value"] {
  line-height: var(--df-leading-tight, 1.12);
}
.df-hero-type-empty > *,
.df-hero-split-empty > *,
.df-hero-estate-empty > *,
.df-hero-frame-empty > *,
.df-hero-trust-empty > * {
  min-width: 0;
}
@media (max-width: 1023px) {
  .df-hero-type-empty {
    min-height: auto;
    padding-block: clamp(3rem, 9vh, 5.5rem);
  }
  .df-hero-split-empty-section {
    min-height: auto;
    padding-block: clamp(3.5rem, 10vh, 6rem);
  }
  .df-hero-bleed-empty-content {
    min-height: min(88svh, 52rem);
    padding-top: clamp(5rem, 14vh, 8rem);
  }
  .df-hero-type-empty [class*="-index-num"] {
    font-size: clamp(3rem, 12vw, 5rem) !important;
    line-height: 1 !important;
  }
}

.df-hero-estate-empty-section { min-height: min(95svh, 58rem); }
.df-hero-estate-empty-copy { text-align: start; }
.df-hero-estate-empty-visual {
  position: relative;
  min-height: clamp(20rem, 48vh, 32rem);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 18%, var(--color-background)), var(--color-background)),
    radial-gradient(ellipse 70% 60% at 70% 30%, color-mix(in srgb, var(--color-accent, var(--color-signal)) 12%, transparent), transparent 60%);
}

.df-hero-frame-empty-section { min-height: min(88svh, 54rem); }
.df-hero-frame-empty-copy { text-align: start; }
.df-hero-frame-empty-visual {
  position: relative;
  min-height: clamp(16rem, 38vh, 24rem);
}
.df-hero-scrim {
  background: linear-gradient(
    to inline-end,
    color-mix(in srgb, var(--color-primary) 90%, transparent) 0%,
    color-mix(in srgb, var(--color-primary) 70%, transparent) 45%,
    transparent 100%
  );
}
.df-scrim-inline {
  background: linear-gradient(
    to inline-end,
    color-mix(in srgb, var(--color-background) 90%, transparent) 0%,
    color-mix(in srgb, var(--color-background) 35%, transparent) 52%,
    transparent 100%
  );
}

/* Premium empty image slots — intentional editorial negative space */
.df-slot-empty {
  position: relative;
  display: block;
  overflow: hidden;
  min-height: var(--df-slot-min-h, 11rem);
  background:
    radial-gradient(
      ellipse 90% 65% at 50% -10%,
      color-mix(in srgb, var(--color-accent, var(--color-primary)) 7%, transparent),
      transparent 68%
    ),
    linear-gradient(
      168deg,
      color-mix(in srgb, var(--color-surface, #fff) 94%, var(--color-primary)) 0%,
      color-mix(in srgb, var(--color-background) 97%, var(--color-primary)) 100%
    );
  border: 1px solid color-mix(in srgb, var(--color-foreground) 7%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 40%, transparent);
}
.df-slot-empty::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      color-mix(in srgb, var(--color-foreground) 4%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-foreground) 4%, transparent) 1px,
      transparent 1px
    );
  background-size: 3.5rem 3.5rem;
  opacity: 0.45;
  mask-image: radial-gradient(ellipse 75% 75% at 50% 45%, #000 20%, transparent 72%);
}
.df-slot-empty::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: auto 12% 14%;
  height: 1px;
  background: linear-gradient(
    to inline-end,
    transparent,
    color-mix(in srgb, var(--color-accent, var(--color-primary)) 35%, transparent),
    transparent
  );
  opacity: 0.65;
}
[data-slot-empty="hero"].df-slot-empty {
  min-height: var(--df-slot-min-h-hero, 18rem);
}
[data-slot-empty="gallery"].df-slot-empty,
[data-slot-empty="products"].df-slot-empty {
  min-height: var(--df-slot-min-h-media, 14rem);
}
.df-glow-orb {
  pointer-events: none;
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  opacity: 0.35;
}
.df-quote-mark {
  font-family: var(--font-display), ui-serif, Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  color: color-mix(in srgb, var(--color-signal, var(--color-accent)) 28%, transparent);
}
.df-star { color: var(--color-signal, var(--color-accent)); letter-spacing: 0.1em; }
.df-metric {
  font-family: var(--font-display), ui-serif, Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 500;
  letter-spacing: var(--df-tracking-tight);
  color: var(--color-foreground);
  line-height: var(--df-leading-tight, 1.12);
}
.df-grid-bg {
  background-image:
    linear-gradient(var(--color-grid, color-mix(in srgb, var(--color-foreground) 4%, transparent)) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid, color-mix(in srgb, var(--color-foreground) 4%, transparent)) 1px, transparent 1px);
  background-size: 72px 72px;
}
.v2-template [id] { scroll-margin-top: 5.5rem; }
.v2-template ::selection {
  background: color-mix(in srgb, var(--color-accent, var(--color-signal)) 22%, transparent);
  color: var(--color-foreground);
}
@media (prefers-reduced-motion: reduce) {
  .df-btn-primary::after { display: none; }
}
`.trim();
}
