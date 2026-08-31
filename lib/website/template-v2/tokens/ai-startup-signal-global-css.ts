/** Signal / Aura design system — ai-startup-signal V2 global layer (as-*) */
export function buildAiStartupSignalGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=Syne:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap");

@keyframes as-slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes as-pulse-dot {
  0%, 100% { opacity: 0.45; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
}
@keyframes as-ring-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .as-animate,
  [data-as-motion],
  .motion-safe\\:animate-\\[as-slide-up_0\\.6s_ease_both\\],
  [class*="motion-safe:animate-[as-slide-up"] {
    animation: none !important;
    transition: none !important;
  }
}

.as-font-display { font-family: var(--font-display), "Syne", system-ui, sans-serif; }
.as-font-body { font-family: var(--font-body), "Outfit", system-ui, sans-serif; }
.as-font-mono { font-family: "JetBrains Mono", ui-monospace, monospace; }

.as-eyebrow {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-signal, #2ec8e0);
}
.as-headline {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--color-foreground, #f1f5f9);
  text-wrap: balance;
}
.as-headline-sm {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--color-foreground, #f1f5f9);
  text-wrap: balance;
}
.as-body {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-muted, rgba(241, 245, 249, 0.58));
  max-width: 36rem;
}

.as-section { padding-block: clamp(4rem, 10vw, 6.5rem); }
.as-section-alt {
  background: linear-gradient(180deg, var(--color-surface, #0b1220) 0%, var(--color-background, #030712) 100%);
}
.as-section-glow {
  position: relative;
  isolation: isolate;
}
.as-section-glow::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    ellipse 90% 55% at 50% -15%,
    color-mix(in srgb, var(--color-signal, #2ec8e0) 12%, transparent),
    transparent 68%
  );
}

.as-grid-bg {
  background-image:
    linear-gradient(var(--color-grid, rgba(46, 200, 224, 0.075)) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid, rgba(46, 200, 224, 0.075)) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 20%, transparent 75%);
}

.as-card {
  border: 1px solid var(--border-subtle, rgba(241, 245, 249, 0.06));
  background: color-mix(in srgb, var(--color-surface, #0b1220) 92%, transparent);
  border-radius: var(--radius-lg, 24px);
  box-shadow: var(--shadow-card, 0 0 0 1px rgba(241, 245, 249, 0.08), 0 16px 48px rgba(0, 0, 0, 0.32));
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}
.as-card:hover {
  border-color: var(--border-accent, rgba(232, 54, 78, 0.42));
  transform: translateY(-2px);
  box-shadow: var(--shadow-surface, 0 12px 40px rgba(0, 0, 0, 0.28));
}
.as-card-featured {
  border-color: var(--border-accent, rgba(232, 54, 78, 0.42));
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--color-accent, #e8364e) 8%, var(--color-surface, #0b1220)),
    var(--color-surface, #0b1220)
  );
}

.as-glass-card {
  background: color-mix(in srgb, var(--color-surface, #0b1220) 78%, transparent);
  border: 1px solid var(--border-default, rgba(241, 245, 249, 0.12));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* Selected / important glass surfaces — crimson accent over default glass border */
.as-accent-selected {
  border-color: var(--color-accent, #e8364e) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 0 0 1px color-mix(in srgb, var(--color-accent, #e8364e) 72%, transparent),
    0 0 36px color-mix(in srgb, var(--color-accent, #e8364e) 16%, transparent);
}

.as-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  color: #fff8f9;
  background: var(--color-accent, #e8364e);
  border-radius: var(--radius-md, 16px);
  border: 1px solid transparent;
  box-shadow: 0 0 24px color-mix(in srgb, var(--color-accent, #e8364e) 32%, transparent);
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}
.as-btn-primary:hover {
  background: color-mix(in srgb, var(--color-accent, #e8364e) 88%, white);
  box-shadow: var(--shadow-glow, 0 0 72px rgba(232, 54, 78, 0.24));
  transform: translateY(-1px);
}
.as-btn-primary:active { transform: translateY(0) scale(0.98); }
.as-btn-primary:focus-visible {
  outline: 2px solid var(--color-accent, #e8364e);
  outline-offset: 2px;
}

.as-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-foreground, #f1f5f9);
  background: transparent;
  border: 1px solid var(--border-default, rgba(241, 245, 249, 0.12));
  border-radius: var(--radius-md, 16px);
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.2s ease;
}
.as-btn-secondary:hover {
  border-color: var(--border-accent, rgba(232, 54, 78, 0.42));
  background: color-mix(in srgb, var(--color-accent, #e8364e) 8%, transparent);
  transform: translateY(-1px);
}
.as-btn-secondary:active { transform: translateY(0) scale(0.98); }
.as-btn-secondary:focus-visible {
  outline: 2px solid var(--color-accent, #e8364e);
  outline-offset: 2px;
}

.as-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent, #e8364e);
  outline-offset: 2px;
}

.as-metric {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-signal, #2ec8e0);
}

.as-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default, rgba(241, 245, 249, 0.12));
  background: color-mix(in srgb, var(--color-surface, #0b1220) 88%, transparent);
  padding: 0.35rem 0.75rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-muted, rgba(241, 245, 249, 0.58));
  backdrop-filter: blur(8px);
}

.as-nav-glass {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--border-subtle, rgba(241, 245, 249, 0.06));
  border-radius: var(--radius-xl, 32px);
  background: color-mix(in srgb, var(--color-surface, #0b1220) 72%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}
.as-nav-glass--scrolled {
  border-color: var(--border-default, rgba(241, 245, 249, 0.12));
  background: color-mix(in srgb, var(--color-background, #030712) 88%, transparent);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}
.as-nav-link {
  color: var(--color-muted, rgba(241, 245, 249, 0.58));
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease;
}
.as-nav-link:hover {
  color: var(--color-foreground, #f1f5f9);
  background: color-mix(in srgb, var(--color-accent, #e8364e) 8%, transparent);
}

.as-browser-frame {
  border: 1px solid var(--border-signal, rgba(46, 200, 224, 0.32));
  border-radius: var(--radius-xl, 32px);
  background: color-mix(in srgb, var(--color-ink, #030712) 92%, var(--color-signal, #2ec8e0));
  box-shadow:
    var(--shadow-surface, 0 12px 40px rgba(0, 0, 0, 0.28)),
    0 0 0 1px color-mix(in srgb, var(--color-signal, #2ec8e0) 12%, transparent),
    0 0 80px color-mix(in srgb, var(--color-signal, #2ec8e0) 12%, transparent);
  overflow: hidden;
}
.as-hero-shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle, rgba(240, 249, 255, 0.06));
  background: color-mix(in srgb, var(--color-foreground) 3%, var(--color-surface, #0a101f));
}

.as-hero-dashboard {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1rem;
}
.as-hero-dashboard-panel {
  border-radius: var(--radius-lg, 24px);
  padding: 1rem 1.1rem;
  min-width: 0;
}
.as-hero-dashboard-panel--wide { grid-column: span 8; }
.as-hero-dashboard-panel--narrow { grid-column: span 4; }
.as-hero-dashboard-panel--metric { grid-column: span 6; }
@media (min-width: 640px) {
  .as-hero-dashboard-panel--metric.sm\\:col-span-3,
  .as-hero-dashboard-panel--metric { grid-column: span 3; }
}
@media (max-width: 767px) {
  .as-hero-dashboard-panel--wide,
  .as-hero-dashboard-panel--narrow { grid-column: span 12; }
  .as-hero-dashboard-panel--metric { grid-column: span 6; }
}

.as-hero-dashboard-bar {
  border-radius: 9999px 9999px 4px 4px;
  background: linear-gradient(
    180deg,
    var(--color-signal, #2ec8e0),
    color-mix(in srgb, var(--color-signal, #2ec8e0) 25%, transparent)
  );
  min-height: 12%;
  opacity: 0.9;
}
.as-hero-dashboard-sparkline {
  height: 2px;
  width: 100%;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-signal, #2ec8e0),
    transparent
  );
  opacity: 0.55;
}
.as-hero-dashboard-ring {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--color-signal, #2ec8e0) 25%, transparent);
  border-top-color: var(--color-signal, #2ec8e0);
  animation: as-ring-spin 3.2s linear infinite;
}

.as-bento-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}
.as-bento-tile { grid-column: span 12; }
.as-bento-tile--standard { grid-column: span 12; }
.as-bento-tile--compact { grid-column: span 6; }
.as-bento-tile--wide { grid-column: span 12; }
.as-bento-tile--tall { grid-column: span 12; }
.as-bento-tile--hero { grid-column: span 12; }
@media (min-width: 768px) {
  .as-bento-tile--standard { grid-column: span 6; }
  .as-bento-tile--compact { grid-column: span 4; }
  .as-bento-tile--wide { grid-column: span 8; }
  .as-bento-tile--tall { grid-column: span 4; }
  .as-bento-tile--hero { grid-column: span 8; }
}
@media (min-width: 1024px) {
  .as-bento-tile--standard { grid-column: span 4; }
  .as-bento-tile--compact { grid-column: span 3; }
  .as-bento-tile--wide { grid-column: span 8; }
  .as-bento-tile--tall { grid-column: span 4; }
  .as-bento-tile--hero { grid-column: span 7; }
}

/* Preview-safe layout helpers when Tailwind CDN is unavailable.
   IMPORTANT: lg:* grid columns must stay inside the lg media query.
   Applying 12 columns unconditionally collapses tracks to 0px under gap-12
   on narrow viewports (hero title stacks letter-by-letter). */
[data-v2-package="ai-startup-signal"] .grid { display: grid; }
@media (min-width: 1024px) {
  [data-v2-package="ai-startup-signal"] .lg\\:col-span-5 { grid-column: span 5 / span 5; }
  [data-v2-package="ai-startup-signal"] .lg\\:col-span-7 { grid-column: span 7 / span 7; }
  [data-v2-package="ai-startup-signal"] .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  [data-v2-package="ai-startup-signal"] .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  [data-v2-package="ai-startup-signal"] .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  [data-v2-package="ai-startup-signal"] .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`;
}
