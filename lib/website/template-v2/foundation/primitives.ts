/**
 * Token-driven df-* primitives — shared visual system for all V2 flagship templates.
 */
export function buildFoundationPrimitivesCss(): string {
  return `
/* Design Foundation — primitives */
.v2-template {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--df-text-base);
  line-height: var(--df-leading-normal);
  color: var(--color-foreground);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  letter-spacing: var(--df-tracking-tight);
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
  color: var(--color-muted, color-mix(in srgb, var(--color-foreground) 62%, transparent));
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
.df-section-alt { background: var(--color-surface, #fff); }
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
    radial-gradient(ellipse 70% 55% at 15% 0%, color-mix(in srgb, var(--color-accent, var(--color-signal)) 8%, transparent), transparent 60%),
    radial-gradient(ellipse 55% 45% at 90% 100%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 55%);
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
  background: var(--border-subtle, color-mix(in srgb, var(--color-foreground) 8%, transparent));
}

/* Cards */
.df-card {
  border: var(--df-border-width) solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 8%, transparent));
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-card, 0 4px 24px color-mix(in srgb, var(--color-foreground) 4%, transparent));
  transition:
    box-shadow var(--df-motion-base) var(--df-motion-ease),
    transform var(--df-motion-base) var(--df-motion-ease),
    border-color var(--df-motion-fast) ease;
}
.df-card:hover {
  border-color: var(--border-accent, color-mix(in srgb, var(--color-accent) 28%, transparent));
  box-shadow: var(--shadow-surface, 0 20px 60px color-mix(in srgb, var(--color-foreground) 7%, transparent));
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
  background: color-mix(in srgb, var(--color-surface, #fff) 82%, transparent);
  backdrop-filter: blur(20px);
  border: var(--df-border-width) solid color-mix(in srgb, #fff 60%, var(--border-subtle, transparent));
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-card);
}
.df-card-interactive { cursor: pointer; }
.df-card-interactive:focus-visible { outline: var(--df-focus-width) solid var(--df-focus-color); outline-offset: var(--df-focus-offset); }

/* Buttons */
.df-btn-primary {
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
  border: var(--df-border-width) solid color-mix(in srgb, var(--color-primary) 80%, #000);
  border-radius: 9999px;
  box-shadow: var(--shadow-card);
  transition:
    transform var(--df-motion-fast) var(--df-motion-ease),
    box-shadow var(--df-motion-base) var(--df-motion-ease),
    filter var(--df-motion-fast) ease;
}
.df-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-surface);
  filter: brightness(1.04);
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
  background: var(--color-surface, #fff);
  border: var(--df-border-width) solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  border-radius: 9999px;
  transition:
    border-color var(--df-motion-fast) ease,
    background var(--df-motion-fast) ease,
    transform var(--df-motion-fast) var(--df-motion-ease);
}
.df-btn-secondary:hover {
  border-color: color-mix(in srgb, var(--color-foreground) 18%, var(--border-default, transparent));
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
  border-radius: var(--radius-md, 8px);
  border: var(--df-border-width) solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  background: var(--color-surface, var(--color-background));
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
  border-top: var(--df-border-width) solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 8%, transparent));
  background: var(--color-surface, var(--color-background));
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
  background: linear-gradient(90deg, var(--color-signal, var(--color-accent)), transparent);
}
[dir="rtl"] .df-accent-line { transform-origin: right; }
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
  line-height: 1;
}
.df-grid-bg {
  background-image:
    linear-gradient(var(--color-grid, color-mix(in srgb, var(--color-foreground) 4%, transparent)) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid, color-mix(in srgb, var(--color-foreground) 4%, transparent)) 1px, transparent 1px);
  background-size: 72px 72px;
}
`.trim();
}
