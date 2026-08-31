/** Auto-generated from scripts/_skin-css/forge.css — do not hand-edit */
export function buildForgeDnaCss(): string {
  return `/* Forge Industrial — BLUEPRINT SCHEMATIC DNA (.fg-*) */

@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap");

@keyframes fg-reveal-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fg-dash-draw {
  from { stroke-dashoffset: 120; opacity: 0.2; }
  to { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes fg-grid-pulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.7; }
}

@media (prefers-reduced-motion: reduce) {
  .fg-reveal, .fg-reveal-stagger > *, .fg-btn-primary, .fg-btn-secondary, .fg-callout-line {
    animation: none !important;
    transition: none !important;
  }
  .fg-reveal, .fg-reveal-stagger > * {
    opacity: 1 !important;
    transform: none !important;
  }
}

.fg-font-display { font-family: "Barlow Condensed", var(--font-display), system-ui, sans-serif; }
.fg-font-body { font-family: "Barlow", var(--font-body), system-ui, sans-serif; }
.fg-font-mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }

.fg-grid-paper {
  background-color: var(--color-background);
  background-image:
    linear-gradient(color-mix(in srgb, var(--color-accent, #3B82F6) 18%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--color-accent, #3B82F6) 18%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--border-subtle, #cbd5e1) 80%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--border-subtle, #cbd5e1) 80%, transparent) 1px, transparent 1px);
  background-size: 96px 96px, 96px 96px, 24px 24px, 24px 24px;
  background-position: -1px -1px;
}

.fg-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent, #2563EB);
}

.fg-headline {
  font-family: "Barlow Condensed", var(--font-display), system-ui, sans-serif;
  font-size: clamp(2.25rem, 5.5vw, 3.75rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 0.98;
  text-transform: uppercase;
  color: var(--color-foreground);
  text-wrap: balance;
}

.fg-headline-sm {
  font-family: "Barlow Condensed", var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  line-height: 1.05;
  color: var(--color-foreground);
}

.fg-body {
  font-family: "Barlow", var(--font-body), system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.fg-metric {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: clamp(1.5rem, 3vw, 2.125rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-accent, #2563EB);
  line-height: 1;
}

.fg-btn-primary,
.fg-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.25rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 0;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.fg-btn-primary {
  color: #fff;
  background: var(--color-primary, #1E3A8A);
  border: 1px solid var(--color-primary, #1E3A8A);
}
.fg-btn-primary:hover {
  background: var(--color-accent, #2563EB);
  border-color: var(--color-accent, #2563EB);
}

.fg-btn-secondary {
  color: var(--color-foreground);
  background: transparent;
  border: 1px dashed var(--color-accent, #2563EB);
}
.fg-btn-secondary:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.fg-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent, #2563EB);
  outline-offset: 3px;
}

.fg-section { padding-block: clamp(3.5rem, 8vw, 5.5rem); }
.fg-section-alt {
  background: color-mix(in srgb, var(--color-surface) 88%, var(--color-background));
}

.fg-frame {
  position: relative;
  border: 1.5px dashed var(--color-accent, #2563EB);
  background: color-mix(in srgb, var(--color-background) 92%, transparent);
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.fg-frame::before,
.fg-frame::after {
  content: "";
  position: absolute;
  width: 0.75rem;
  height: 0.75rem;
  border: 1.5px solid var(--color-accent, #2563EB);
  background: var(--color-background);
}
.fg-frame::before { top: -0.4rem; inset-inline-start: -0.4rem; }
.fg-frame::after { bottom: -0.4rem; inset-inline-end: -0.4rem; }

.fg-fig-label {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent, #2563EB);
}

.fg-callout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem 1rem;
  align-items: start;
  border: 1px solid var(--border-default);
  padding: 0.85rem 1rem;
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
}

.fg-callout-ref {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-accent, #2563EB);
  white-space: nowrap;
}

.fg-spec-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
}
.fg-spec-table th,
.fg-spec-table td {
  padding: 0.85rem 0.65rem;
  border-bottom: 1px solid var(--border-subtle);
  text-align: start;
  vertical-align: top;
}
.fg-spec-table th {
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  border-bottom: 2px solid var(--color-accent, #2563EB);
  font-weight: 600;
}
.fg-spec-table td:last-child,
.fg-spec-table th:last-child { text-align: end; }

.fg-title-block {
  display: grid;
  gap: 0.5rem;
  border: 1.5px solid var(--color-foreground);
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fg-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
.fg-reveal.df-is-visible,
.fg-reveal.fg-is-visible,
.fg-reveal.is-visible { opacity: 1; transform: none; }
.fg-reveal-stagger > * { opacity: 0; transform: translateY(12px); transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1); }
.fg-reveal-stagger.df-is-visible > *,
.fg-reveal-stagger.fg-is-visible > *,
.fg-reveal-stagger.is-visible > *,
.fg-reveal.df-is-visible .fg-reveal-stagger > * { opacity: 1; transform: none; }
.fg-reveal-stagger > *:nth-child(1) { transition-delay: 0.04s; }
.fg-reveal-stagger > *:nth-child(2) { transition-delay: 0.09s; }
.fg-reveal-stagger > *:nth-child(3) { transition-delay: 0.14s; }
.fg-reveal-stagger > *:nth-child(4) { transition-delay: 0.19s; }
.fg-reveal-stagger > *:nth-child(5) { transition-delay: 0.24s; }
.fg-reveal-stagger > *:nth-child(6) { transition-delay: 0.29s; }

/* Utility nav — drawing chrome */
.fg-util-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--color-foreground);
  background: var(--color-background);
}
.fg-util-nav-inner {
  display: flex;
  align-items: stretch;
  min-height: 3.25rem;
  max-width: 88rem;
  margin-inline: auto;
}
.fg-util-nav-sheet {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-inline-end: 1px solid var(--border-default);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.fg-util-nav-brand {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  font-family: "Barlow Condensed", system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
  border-inline-end: 1px solid var(--border-default);
}
.fg-util-nav-links {
  display: none;
  flex: 1;
  align-items: center;
  gap: 1.5rem;
  padding-inline: 1.25rem;
}
@media (min-width: 1024px) {
  .fg-util-nav-links { display: flex; }
}
.fg-util-nav-links a {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-muted);
}
.fg-util-nav-links a:hover { color: var(--color-accent); }
.fg-util-nav-cta {
  margin-inline-start: auto;
  display: none;
  align-items: center;
  padding: 0 1.25rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: #fff;
  background: var(--color-primary, #1E3A8A);
}
@media (min-width: 640px) {
  .fg-util-nav-cta { display: inline-flex; }
}

/* Annotated module row */
.fg-module {
  display: grid;
  gap: 1rem;
  padding-block: 1.25rem;
  border-bottom: 1px dashed var(--border-default);
  grid-template-columns: auto 1fr;
}
@media (min-width: 768px) {
  .fg-module {
    grid-template-columns: 5rem 1fr minmax(10rem, 14rem);
    align-items: start;
  }
}
.fg-module-ref {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-accent);
}
.fg-module-note {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  border-inline-start: 1px dashed var(--color-accent);
  padding-inline-start: 0.85rem;
}

/* Case figure plate */
.fg-case-figure {
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 75%, transparent);
}
.fg-case-figure-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px dashed var(--color-accent);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.fg-case-figure-body { padding: 1rem 0.85rem 1.15rem; }

/* Work package row */
.fg-work-package {
  display: grid;
  gap: 0.75rem;
  padding: 1.15rem 0;
  border-bottom: 1px solid var(--border-subtle);
}
@media (min-width: 768px) {
  .fg-work-package {
    grid-template-columns: 8rem 1fr auto;
    align-items: start;
  }
}
.fg-work-package-id {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-accent);
}
.fg-work-package-price {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-foreground);
  white-space: nowrap;
}
`;
}
