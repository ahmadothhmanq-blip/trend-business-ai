/** Auto-generated from scripts/_skin-css/obsidian.css — do not hand-edit */
export function buildObsidianDnaCss(): string {
  return `/* Obsidian Noir — TYPOGRAPHY MANIFESTO DNA (.ob-*) */

@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@400;500;600&display=swap");

@keyframes ob-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ob-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ob-rule {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ob-reveal, .ob-reveal-stagger > *, .ob-rule, .ob-wordmark {
    animation: none !important;
    transition: none !important;
  }
  .ob-reveal, .ob-reveal-stagger > * {
    opacity: 1 !important;
    transform: none !important;
  }
}

.ob-font-display { font-family: "Cormorant Garamond", var(--font-display), Georgia, serif; }
.ob-font-body { font-family: "Manrope", var(--font-body), system-ui, sans-serif; }

.ob-eyebrow {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.ob-headline {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(2.75rem, 8vw, 6.5rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 0.95;
  color: var(--color-foreground);
}

.ob-headline-sm {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--color-foreground);
}

.ob-body {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--color-muted);
  font-weight: 400;
}

.ob-wordmark {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(4.5rem, 16vw, 11rem);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 0.85;
  color: var(--color-foreground);
}

.ob-sentence {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: var(--color-muted);
  max-width: 36rem;
}

.ob-thesis-num {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  color: color-mix(in srgb, var(--color-foreground) 22%, transparent);
  line-height: 1;
}

.ob-thesis-title {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}

.ob-rule {
  display: block;
  height: 1px;
  width: 100%;
  background: var(--border-default);
  border: 0;
  transform-origin: left center;
}

.ob-btn-primary,
.ob-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.7rem 1.25rem;
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 0;
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.ob-btn-primary {
  color: var(--color-background);
  background: var(--color-foreground);
  border: 1px solid var(--color-foreground);
}
.ob-btn-primary:hover {
  background: transparent;
  color: var(--color-foreground);
}

.ob-btn-secondary {
  color: var(--color-foreground);
  background: transparent;
  border: 1px solid var(--border-default);
}
.ob-btn-secondary:hover { border-color: var(--color-foreground); }

.ob-focus-ring:focus-visible { outline: 1px solid var(--color-foreground); outline-offset: 4px; }

.ob-section {
  padding-block: clamp(5rem, 12vw, 9rem);
  background: var(--color-background);
}

.ob-metric {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--color-foreground);
}

.ob-reveal { opacity: 0; transform: translateY(12px); transition: opacity 0.8s ease, transform 0.8s ease; }
.ob-reveal.ob-is-visible,
.ob-reveal.df-is-visible { opacity: 1; transform: none; }
.ob-reveal-stagger > * { opacity: 0; transform: translateY(10px); transition: opacity 0.7s ease, transform 0.7s ease; }
.ob-reveal-stagger.ob-is-visible > *,
.ob-reveal-stagger.df-is-visible > *,
.ob-reveal.ob-is-visible .ob-reveal-stagger > *,
.ob-reveal.df-is-visible .ob-reveal-stagger > * { opacity: 1; transform: none; }
.ob-reveal-stagger > *:nth-child(1) { transition-delay: 0.05s; }
.ob-reveal-stagger > *:nth-child(2) { transition-delay: 0.12s; }
.ob-reveal-stagger > *:nth-child(3) { transition-delay: 0.19s; }
.ob-reveal-stagger > *:nth-child(4) { transition-delay: 0.26s; }

.ob-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-background) 88%, transparent);
  backdrop-filter: blur(10px);
}
.ob-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 72rem;
  margin-inline: auto;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
}
@media (min-width: 640px) {
  .ob-nav-inner { padding-inline: 2rem; }
}
.ob-nav-brand {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--color-foreground);
}
.ob-nav-links { display: none; gap: 2rem; }
@media (min-width: 1024px) { .ob-nav-links { display: flex; } }
.ob-nav-links a {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-muted);
}
.ob-nav-links a:hover { color: var(--color-foreground); }

.ob-attribution {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.ob-input,
.ob-textarea {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--border-default);
  border-radius: 0;
  background: transparent;
  padding: 0.85rem 0;
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.9375rem;
  color: var(--color-foreground);
}
.ob-input:focus-visible,
.ob-textarea:focus-visible {
  outline: none;
  border-bottom-color: var(--color-foreground);
}

.ob-manifesto-shell {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3rem, 10vw, 7rem) 1.25rem;
}
@media (min-width: 640px) {
  .ob-manifesto-shell { padding-inline: 2rem; }
}
`;
}
