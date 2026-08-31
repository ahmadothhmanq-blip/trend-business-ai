/** Auto-generated from scripts/_skin-css/pulse.css — do not hand-edit */
export function buildPulseDnaCss(): string {
  return `/* Pulse Fintech — LIVE TICKER / DATA STREAM DNA (.pu-*) */

@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap");

@keyframes pu-ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes pu-pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent, #22c55e) 55%, transparent); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px transparent; }
}
@keyframes pu-bar {
  from { transform: scaleY(0.35); opacity: 0.5; }
  to { transform: scaleY(1); opacity: 1; }
}
@keyframes pu-feed-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .pu-ticker-track, .pu-live-dot, .pu-chart-bar, .pu-reveal, .pu-reveal-stagger > * {
    animation: none !important;
    transition: none !important;
  }
  .pu-reveal, .pu-reveal-stagger > * {
    opacity: 1 !important;
    transform: none !important;
  }
}

.pu-font-display { font-family: "IBM Plex Sans", var(--font-display), system-ui, sans-serif; }
.pu-font-body { font-family: "IBM Plex Sans", var(--font-body), system-ui, sans-serif; }
.pu-font-mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }

.pu-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent, #22c55e);
}

.pu-headline {
  font-family: "IBM Plex Sans", var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-foreground);
}

.pu-headline-sm {
  font-family: "IBM Plex Sans", var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.25rem, 2.5vw, 1.875rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--color-foreground);
}

.pu-body {
  font-family: "IBM Plex Sans", var(--font-body), system-ui, sans-serif;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.pu-btn-primary,
.pu-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0.55rem 1rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.pu-btn-primary {
  color: #04110a;
  background: var(--color-accent, #22c55e);
  border: 1px solid color-mix(in srgb, var(--color-accent, #22c55e) 80%, #000);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-accent) 20%, transparent);
}
.pu-btn-primary:hover {
  box-shadow: 0 0 24px color-mix(in srgb, var(--color-accent) 35%, transparent);
}

.pu-btn-secondary {
  color: var(--color-foreground);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  border: 1px solid var(--border-default);
}
.pu-btn-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }

.pu-focus-ring:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

.pu-section {
  padding-block: clamp(2.5rem, 6vw, 4.5rem);
  background: var(--color-background);
}

.pu-metric {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-accent, #22c55e);
}

.pu-reveal { opacity: 0; transform: translateY(10px); transition: opacity 0.55s ease, transform 0.55s ease; }
.pu-reveal.pu-is-visible,
.pu-reveal.df-is-visible { opacity: 1; transform: none; }
.pu-reveal-stagger > * { opacity: 0; transform: translateY(8px); transition: opacity 0.45s ease, transform 0.45s ease; }
.pu-reveal-stagger.pu-is-visible > *,
.pu-reveal-stagger.df-is-visible > *,
.pu-reveal.pu-is-visible .pu-reveal-stagger > *,
.pu-reveal.df-is-visible .pu-reveal-stagger > * { opacity: 1; transform: none; }
.pu-reveal-stagger > *:nth-child(1) { transition-delay: 0.03s; }
.pu-reveal-stagger > *:nth-child(2) { transition-delay: 0.07s; }
.pu-reveal-stagger > *:nth-child(3) { transition-delay: 0.11s; }
.pu-reveal-stagger > *:nth-child(4) { transition-delay: 0.15s; }
.pu-reveal-stagger > *:nth-child(5) { transition-delay: 0.19s; }
.pu-reveal-stagger > *:nth-child(6) { transition-delay: 0.23s; }

.pu-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-background) 92%, #000);
  border-bottom: 1px solid var(--border-subtle);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}
.pu-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 96rem;
  margin-inline: auto;
  min-height: 2.75rem;
  padding: 0.4rem 1rem;
}
@media (min-width: 640px) {
  .pu-nav-inner { padding-inline: 1.5rem; }
}
.pu-nav-brand {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-accent, #22c55e);
  text-decoration: none;
}
.pu-nav-links { display: none; gap: 1.25rem; }
@media (min-width: 1024px) { .pu-nav-links { display: flex; } }
.pu-nav-links a {
  font-size: 0.75rem;
  color: var(--color-muted);
  text-decoration: none;
}
.pu-nav-links a:hover { color: var(--color-accent); }

.pu-ticker {
  overflow: hidden;
  border-bottom: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--color-surface) 80%, #000);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
}
.pu-ticker-track {
  display: flex;
  width: max-content;
  gap: 2rem;
  padding: 0.55rem 0;
  animation: pu-ticker 32s linear infinite;
}
.pu-ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  color: var(--color-muted);
}
.pu-ticker-sym { color: var(--color-foreground); font-weight: 600; }
.pu-ticker-up { color: var(--color-accent, #22c55e); }
.pu-ticker-down { color: #f87171; }

.pu-desk {
  display: grid;
  gap: 0.75rem;
}
@media (min-width: 1024px) {
  .pu-desk { grid-template-columns: 1.15fr 0.85fr; }
}

.pu-panel {
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 88%, #000);
  border-radius: 0.5rem;
  overflow: hidden;
}
.pu-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  color: var(--color-muted);
  background: color-mix(in srgb, var(--color-foreground) 3%, transparent);
}
.pu-panel-body { padding: 0.75rem; }

.pu-live-dot {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: var(--color-accent, #22c55e);
  animation: pu-pulse-dot 1.6s ease infinite;
}

.pu-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
}
.pu-feed li {
  display: grid;
  grid-template-columns: 4.5rem 1fr auto;
  gap: 0.75rem;
  align-items: baseline;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--color-muted);
}
.pu-feed li:last-child { border-bottom: 0; }
.pu-feed-time { color: color-mix(in srgb, var(--color-muted) 70%, transparent); }
.pu-feed-msg { color: var(--color-foreground); }
.pu-feed-tag { color: var(--color-accent); }

.pu-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
  height: 9rem;
  padding-top: 0.5rem;
}
.pu-chart-bar {
  flex: 1;
  border-radius: 0.15rem 0.15rem 0 0;
  background: linear-gradient(180deg, var(--color-accent, #22c55e), color-mix(in srgb, var(--color-accent) 25%, transparent));
  transform-origin: bottom;
  animation: pu-bar 0.8s ease both;
  min-height: 12%;
}

.pu-stat-row {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 768px) {
  .pu-stat-row { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.pu-stat-cell {
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  padding: 0.85rem 0.9rem;
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}

.pu-input,
.pu-textarea {
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-background) 80%, transparent);
  padding: 0.65rem 0.75rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
  color: var(--color-foreground);
}
.pu-input:focus-visible,
.pu-textarea:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.pu-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.75rem;
}
.pu-table th,
.pu-table td {
  text-align: start;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
}
.pu-table th {
  color: var(--color-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.625rem;
}
`;
}
