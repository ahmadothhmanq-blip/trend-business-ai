/** Auto-generated from scripts/_skin-css/prism.css — do not hand-edit */
export function buildPrismDnaCss(): string {
  return `/* Prism Aurora — ASYMMETRIC BENTO MOSAIC DNA (.pr-*) */

@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Sora:wght@400;500;600&display=swap");

@keyframes pr-reveal-up {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pr-tile-in {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pr-field-drift {
  0%, 100% { background-position: 0% 40%; }
  50% { background-position: 100% 60%; }
}

@media (prefers-reduced-motion: reduce) {
  .pr-reveal, .pr-reveal-stagger > *, .pr-mosaic > *, .pr-btn-primary, .pr-btn-secondary {
    animation: none !important;
    transition: none !important;
  }
  .pr-reveal, .pr-reveal-stagger > *, .pr-mosaic > * {
    opacity: 1 !important;
    transform: none !important;
  }
}

.pr-font-display { font-family: "Outfit", var(--font-display), system-ui, sans-serif; }
.pr-font-body { font-family: "Sora", var(--font-body), system-ui, sans-serif; }

.pr-eyebrow {
  font-family: "Sora", var(--font-body), system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent, #A78BFA);
}

.pr-headline {
  font-family: "Outfit", var(--font-display), system-ui, sans-serif;
  font-size: clamp(2.25rem, 5.5vw, 4.25rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.98;
  color: var(--color-foreground);
}

.pr-headline-sm {
  font-family: "Outfit", var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-foreground);
}

.pr-body {
  font-family: "Sora", var(--font-body), system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.pr-btn-primary,
.pr-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.75rem 1.35rem;
  font-family: "Sora", var(--font-body), system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.pr-btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary, #6D28D9), var(--color-accent, #A78BFA));
  border: 1px solid transparent;
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-primary) 28%, transparent);
}
.pr-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px color-mix(in srgb, var(--color-accent) 34%, transparent); }

.pr-btn-secondary {
  color: var(--color-foreground);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  border: 1px solid var(--border-default);
  backdrop-filter: blur(10px);
}
.pr-btn-secondary:hover { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface)); }

.pr-focus-ring:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }

.pr-section { padding-block: clamp(3.5rem, 8vw, 6rem); }
.pr-metric {
  font-family: "Outfit", var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-primary);
}

.pr-reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
.pr-reveal.pr-is-visible,
.pr-reveal.df-is-visible { opacity: 1; transform: none; }
.pr-reveal-stagger > * { opacity: 0; transform: translateY(16px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
.pr-reveal-stagger.pr-is-visible > *,
.pr-reveal-stagger.df-is-visible > *,
.pr-reveal.pr-is-visible .pr-reveal-stagger > *,
.pr-reveal.df-is-visible .pr-reveal-stagger > * { opacity: 1; transform: none; }
.pr-reveal-stagger > *:nth-child(1) { transition-delay: 0.04s; }
.pr-reveal-stagger > *:nth-child(2) { transition-delay: 0.1s; }
.pr-reveal-stagger > *:nth-child(3) { transition-delay: 0.16s; }
.pr-reveal-stagger > *:nth-child(4) { transition-delay: 0.22s; }
.pr-reveal-stagger > *:nth-child(5) { transition-delay: 0.28s; }
.pr-reveal-stagger > *:nth-child(6) { transition-delay: 0.34s; }

/* Mosaic grid — unequal tiles, not 3 equal columns */
.pr-mosaic {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .pr-mosaic {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-rows: minmax(6.5rem, auto);
    gap: 0.875rem;
  }
}

.pr-tile {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  border: 1px solid var(--border-subtle);
  background: var(--color-surface);
  padding: 1.25rem 1.35rem;
  min-height: 7.5rem;
}
@media (min-width: 768px) {
  .pr-tile { padding: 1.5rem 1.65rem; }
}

.pr-tile-brand {
  background:
    radial-gradient(120% 90% at 10% 0%, color-mix(in srgb, var(--color-accent) 42%, transparent), transparent 55%),
    radial-gradient(90% 80% at 100% 100%, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 50%),
    var(--color-surface);
  background-size: 140% 140%;
  animation: pr-field-drift 18s ease-in-out infinite;
}
.pr-tile-cta {
  background: linear-gradient(160deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 70%, #1e1038));
  color: #fff;
  border-color: transparent;
}
.pr-tile-cta .pr-body { color: rgba(255,255,255,0.78); }
.pr-tile-field-a {
  background: linear-gradient(145deg, color-mix(in srgb, var(--color-accent) 18%, var(--color-surface)), var(--color-surface));
}
.pr-tile-field-b {
  background: linear-gradient(200deg, color-mix(in srgb, var(--color-primary) 14%, var(--color-surface)), var(--color-surface));
}
.pr-tile-field-c {
  background: color-mix(in srgb, var(--color-secondary, #3730A3) 12%, var(--color-surface));
}
.pr-tile-ink {
  background: var(--color-foreground);
  color: var(--color-background);
  border-color: transparent;
}
.pr-tile-ink .pr-body { color: color-mix(in srgb, var(--color-background) 72%, transparent); }

@media (min-width: 768px) {
  .pr-span-7 { grid-column: span 7; }
  .pr-span-5 { grid-column: span 5; }
  .pr-span-4 { grid-column: span 4; }
  .pr-span-6 { grid-column: span 6; }
  .pr-span-8 { grid-column: span 8; }
  .pr-span-3 { grid-column: span 3; }
  .pr-span-12 { grid-column: span 12; }
  .pr-row-2 { grid-row: span 2; min-height: 14rem; }
  .pr-row-3 { grid-row: span 3; min-height: 20rem; }
}

.pr-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-background) 72%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease, background 0.25s ease;
}
.pr-nav.is-scrolled { border-bottom-color: var(--border-subtle); }
.pr-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 88rem;
  margin-inline: auto;
  min-height: 3.25rem;
  padding: 0.5rem 1.25rem;
}
@media (min-width: 640px) {
  .pr-nav-inner { padding-inline: 2rem; }
}
.pr-nav-brand {
  font-family: "Outfit", var(--font-display), system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--color-foreground);
}
.pr-nav-links { display: none; gap: 1.5rem; }
@media (min-width: 1024px) { .pr-nav-links { display: flex; } }
.pr-nav-links a {
  font-family: "Sora", var(--font-body), system-ui, sans-serif;
  font-size: 0.8125rem;
  color: var(--color-muted);
  text-decoration: none;
}
.pr-nav-links a:hover { color: var(--color-foreground); }

.pr-quote {
  font-family: "Outfit", var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.25;
}

.pr-input,
.pr-textarea {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  padding: 0.75rem 1rem;
  font-family: "Sora", var(--font-body), system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--color-foreground);
}
.pr-input:focus-visible,
.pr-textarea:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.pr-glass-card {
  border: 1px solid var(--border-accent);
  background: color-mix(in srgb, var(--color-surface) 78%, transparent);
  backdrop-filter: blur(12px);
}
`;
}
