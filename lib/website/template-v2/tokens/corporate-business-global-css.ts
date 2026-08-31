/** Executive Atlas design system — corporate-business V2 global layer */
export function buildCorporateBusinessGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Mono:ital@0;1&family=Inter:wght@300;400;500;600&family=Noto+Sans+Arabic:wght@400;500;600&display=swap");

@keyframes cb-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes cb-slide-up {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes cb-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
[dir="rtl"] .cb-marquee-track { animation-direction: reverse; }

@media (prefers-reduced-motion: reduce) {
  .cb-animate, [data-cb-motion], .cb-marquee-track { animation: none !important; transition: none !important; }
}

.cb-font-display { font-family: var(--font-display), "Cormorant Garamond", Georgia, serif; }
.cb-font-body { font-family: var(--font-body), "Inter", system-ui, sans-serif; }
.cb-font-mono { font-family: "DM Mono", ui-monospace, monospace; }
.cb-eyebrow {
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-signal);
}
.cb-headline {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: var(--df-text-display, clamp(1.875rem, 3vw, 2.5rem));
  font-weight: 600; line-height: var(--df-leading-display, 1.1);
  letter-spacing: var(--df-headline-tracking, -0.024em);
  color: var(--color-foreground); text-wrap: balance;
}
.cb-headline-sm {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: var(--df-text-2xl, clamp(1.3125rem, 2vw, 1.75rem));
  font-weight: 600; line-height: 1.14;
  letter-spacing: var(--df-headline-tracking, -0.02em);
  color: var(--color-foreground); text-wrap: balance;
}
.cb-body {
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: var(--df-text-base, 1rem); line-height: 1.65; font-weight: 400;
  color: var(--color-muted); max-width: 36rem;
}
.cb-prose { font-size: var(--df-text-base, 1rem); line-height: 1.65; color: var(--color-muted); max-width: 36rem; }

.cb-section { padding-block: var(--cb-section-y, clamp(4.5rem, 9.5vw, 7.25rem)); }
.cb-section-tight { padding-block: clamp(3.25rem, 7vw, 5rem); }
.cb-section-alt { background: var(--color-surface-elevated, #FDFCF9); }
.cb-section-glow {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.cb-section-glow::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 88% 58% at 18% -8%, var(--df-accent-glow, color-mix(in srgb, var(--color-signal) 14%, transparent)), transparent 68%);
}
.cb-section-ink { background: var(--color-ink); color: #fff; }
.cb-divider { height: 1px; background: var(--border-subtle); width: 100%; }
.cb-container { margin-inline: auto; max-width: 88rem; padding-inline: clamp(1.25rem, 4vw, 2.5rem); }

.cb-surface {
  background: var(--color-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
.cb-surface-elevated {
  background: linear-gradient(165deg, #fff 0%, var(--color-surface-elevated, #FDFCF9) 100%);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl, 20px);
  box-shadow: var(--shadow-surface);
}
.cb-card {
  border: 1px solid var(--df-border-subtle, var(--border-subtle));
  background: var(--color-surface-elevated, var(--color-surface));
  border-radius: var(--df-radius-lg, var(--radius-lg));
  box-shadow: var(--df-shadow-card, var(--shadow-card));
  transition: box-shadow 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.4s ease;
}
.cb-card:hover {
  box-shadow: var(--df-shadow-elevated, var(--shadow-surface));
  border-color: var(--df-border-accent, var(--border-accent));
  transform: translateY(-2px);
}
.cb-card-featured, .se-card-featured {
  border-color: color-mix(in srgb, var(--color-signal) 28%, var(--border-subtle));
  background: linear-gradient(155deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 88%, var(--color-primary)) 100%);
  color: #fff; box-shadow: var(--shadow-surface);
}
.cb-card-glass {
  background: color-mix(in srgb, var(--color-surface-elevated, var(--color-surface)) 82%, transparent);
  backdrop-filter: blur(20px) saturate(1.1);
  border: 1px solid var(--df-border-subtle, color-mix(in srgb, #fff 60%, var(--border-subtle)));
  border-radius: var(--df-radius-lg, var(--radius-lg));
  box-shadow: var(--df-shadow-card, 0 8px 32px rgba(8,14,24,0.06));
  transition: box-shadow 0.4s ease, border-color 0.35s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
}
.cb-card-glass:hover {
  border-color: var(--df-border-accent, var(--border-accent));
  box-shadow: var(--df-shadow-elevated, var(--shadow-surface));
  transform: translateY(-1px);
}

.cb-btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  min-height: 3.125rem; padding: 0 1.75rem;
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: var(--df-text-base, 1rem); font-weight: 500; letter-spacing: -0.01em;
  text-decoration: none; color: var(--color-ink);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-signal) 95%, #fff), var(--color-signal));
  border: 1px solid color-mix(in srgb, var(--color-signal) 70%, #000);
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(8,14,24,0.06), 0 8px 24px color-mix(in srgb, var(--color-signal) 25%, transparent);
  transition: transform 0.25s ease, box-shadow 0.35s ease, filter 0.25s ease;
}
.cb-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(8,14,24,0.08), 0 12px 32px color-mix(in srgb, var(--color-signal) 32%, transparent);
  filter: brightness(1.03);
}
.cb-btn-secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  min-height: 3.125rem; padding: 0 1.75rem;
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: var(--df-text-base, 1rem); font-weight: 500; letter-spacing: -0.01em;
  text-decoration: none; color: var(--color-foreground);
  background: var(--color-surface);
  border: 1px solid var(--border-default);
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(8,14,24,0.04);
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.cb-btn-secondary:hover {
  border-color: color-mix(in srgb, var(--color-foreground) 18%, var(--border-default));
  background: var(--color-surface-elevated, #FDFCF9);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(8,14,24,0.06);
}
.cb-btn-ghost {
  display: inline-flex; align-items: center; gap: 0.375rem;
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: 0.875rem; font-weight: 500; color: var(--color-signal);
  text-decoration: none; transition: gap 0.25s ease, opacity 0.25s ease;
}
.cb-btn-ghost:hover { gap: 0.625rem; opacity: 0.85; }
.cb-focus-ring:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }

.cb-metric {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: var(--df-text-xl, clamp(1.375rem, 2.2vw, 1.75rem));
  font-weight: 600;
  letter-spacing: var(--df-headline-tracking, -0.02em);
  color: var(--color-foreground); line-height: 1;
}
.cb-metric-label {
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: var(--df-text-label, 0.75rem); line-height: 1.5; color: var(--color-muted);
}
.cb-metric-detail {
  font-family: var(--font-mono), "DM Mono", monospace;
  font-size: var(--df-text-caption, 0.6875rem); letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--color-signal);
}
.cb-label {
  font-family: var(--font-mono), "DM Mono", monospace;
  font-size: var(--df-text-caption, 0.6875rem);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.cb-signal { color: var(--color-signal); }

.cb-hero-atmosphere {
  pointer-events: none; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 90% 70% at 85% 15%, var(--df-accent-glow, color-mix(in srgb, var(--color-signal) 9%, transparent)), transparent 55%),
    radial-gradient(ellipse 60% 50% at 10% 80%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 50%),
    linear-gradient(180deg, var(--color-background) 0%, color-mix(in srgb, var(--color-surface-elevated, #FDFCF9) 40%, var(--color-background)) 100%);
}
.cb-hero-grid {
  pointer-events: none; position: absolute; inset: 0; opacity: 0.35;
  background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse 80% 70% at 70% 40%, #000 20%, transparent 75%);
}
.cb-grid-bg {
  background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 72px 72px;
}
.cb-paper-grain::after {
  content: ""; pointer-events: none; position: absolute; inset: 0; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.cb-hero-visual-glow {
  pointer-events: none; position: absolute; inset: -12%;
  background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--color-signal) 14%, transparent), transparent 62%);
  filter: blur(40px);
}
.cb-hero-frame {
  position: relative; overflow: hidden;
  border-radius: var(--radius-xl, 20px);
  border: 1px solid color-mix(in srgb, #fff 50%, var(--border-default));
  box-shadow: var(--shadow-surface), inset 0 1px 0 color-mix(in srgb, #fff 80%, transparent);
}
.cb-hero-frame::after {
  content: ""; pointer-events: none; position: absolute; inset: 0;
  background: linear-gradient(195deg, transparent 40%, color-mix(in srgb, var(--color-ink) 35%, transparent) 100%);
}
.cb-accent-line { height: 1px; width: 4rem; background: linear-gradient(90deg, var(--color-signal), transparent); }
[dir="rtl"] .cb-accent-line { transform-origin: right; }

.cb-trust-logo {
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: 0.75rem; font-weight: 500; letter-spacing: 0.16em;
  text-transform: uppercase; color: color-mix(in srgb, var(--color-foreground) 32%, transparent);
  white-space: nowrap;
}
.cb-trust-badge {
  display: inline-flex; align-items: center; gap: 0.375rem;
  border-radius: 9999px; border: 1px solid var(--border-default);
  background: var(--color-surface); padding: 0.35rem 0.875rem;
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.04em;
  color: var(--color-muted);
}
.cb-integration-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.5rem; height: 2.5rem; flex-shrink: 0;
  border-radius: 0.625rem;
  border: 1px solid color-mix(in srgb, var(--color-signal) 24%, var(--border-subtle));
  background: color-mix(in srgb, var(--color-signal) 8%, var(--color-surface));
  font-family: var(--font-mono), "DM Mono", monospace;
  font-size: 0.625rem; font-weight: 500; letter-spacing: 0.08em;
  color: var(--color-signal);
}
.cb-integration-tile {
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.3s ease;
}
.cb-integration-tile:hover {
  transform: translateY(-2px);
  border-color: var(--df-border-accent, var(--border-accent));
  box-shadow: var(--df-shadow-elevated, var(--shadow-surface));
}
.cb-trust-strip { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem 2rem; }
.cb-marquee-track { animation: cb-marquee 36s linear infinite; }
.cb-trust-fade {
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.cb-nav-link {
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: 0.875rem; font-weight: 500; letter-spacing: -0.01em;
  color: color-mix(in srgb, var(--color-foreground) 65%, transparent);
  text-decoration: none; position: relative; padding-block: 0.25rem;
  transition: color 0.2s ease;
}
.cb-nav-link:hover, .cb-nav-link[data-active="true"] { color: var(--color-foreground); }
.cb-nav-link::after {
  content: ""; position: absolute; bottom: 0; left: 0; height: 1px; width: 0;
  background: var(--color-signal); transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
}
.cb-nav-link:hover::after, .cb-nav-link[data-active="true"]::after { width: 100%; }

.cb-quote-mark {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: 3.25rem; line-height: 1; color: color-mix(in srgb, var(--color-signal) 22%, transparent);
}
.cb-star { color: var(--color-signal); letter-spacing: 0.14em; }

.cb-input, .cb-textarea {
  width: 100%; border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--color-surface);
  padding: 0.875rem 1rem;
  font-family: var(--font-body), "Inter", system-ui, sans-serif;
  font-size: var(--df-text-base, 1rem); color: var(--color-foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.cb-input:focus-visible, .cb-textarea:focus-visible {
  outline: none; border-color: var(--color-signal);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-signal) 12%, transparent);
}
`;
}
