/** Auto-generated from scripts/_skin-css/kinetic.css — do not hand-edit */
export function buildKineticDnaCss(): string {
  return `/* Kinetic — creative-portfolio — HORIZONTAL FILMSTRIP DNA (.cp-*) */

.cp-nav {
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 40;
  background: transparent;
  border: 0;
  mix-blend-mode: difference;
  color: #fff;
}

.cp-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  max-width: none;
  padding: 1.25rem 1.5rem;
}

.cp-nav-brand {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
}

.cp-nav-links {
  display: none;
  gap: 1.75rem;
}

@media (min-width: 1024px) {
  .cp-nav-links {
    display: flex;
  }
}

.cp-nav-links a {
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  opacity: 0.75;
}

.cp-nav-links a:hover {
  opacity: 1;
}

/* Title card / slate — not SaaS centered hero */
.cp-title-card {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 6rem 1.5rem 2.5rem;
  background: var(--color-background);
  border-bottom: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 12%, transparent));
}

.cp-title-card-slate {
  max-width: 72rem;
}

.cp-title-card-index {
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-volt, #E8FF47);
  margin: 0 0 1.5rem;
}

.cp-title-card-headline {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2.75rem, 11vw, 7.5rem);
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: -0.04em;
  color: var(--color-foreground);
  max-width: 14ch;
  margin: 0;
  text-wrap: balance;
}

.cp-title-card-deck {
  margin: 2rem 0 0;
  max-width: 36rem;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.cp-title-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-foreground) 55%, transparent);
}

.cp-title-card-cta {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-volt, #E8FF47);
}

.cp-title-card-cta:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Horizontal filmstrip — primary work navigation */
.cp-filmstrip-section {
  background: var(--color-background);
  border-block: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 10%, transparent));
}

.cp-filmstrip-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem 0.75rem;
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.625rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-foreground) 50%, transparent);
}

.cp-filmstrip {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--color-volt, #E8FF47) transparent;
}

.cp-filmstrip-track {
  display: flex;
  width: max-content;
  min-height: min(100svh, 56rem);
}

.cp-film-panel {
  flex: 0 0 100vw;
  width: 100vw;
  max-width: 100vw;
  min-height: min(100svh, 56rem);
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1.5rem;
  padding: 2rem 1.5rem 2.5rem;
  box-sizing: border-box;
  border-inline-end: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  background: var(--color-background);
}

@media (min-width: 768px) {
  .cp-film-panel {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    grid-template-rows: auto 1fr;
    padding: 3rem 4rem 3.5rem;
    align-items: stretch;
  }

  .cp-film-panel-visual {
    grid-row: 1 / -1;
    grid-column: 2;
  }
}

.cp-film-panel-index {
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-volt, #E8FF47);
}

.cp-film-panel-title {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  margin: 0.75rem 0 0;
  max-width: 12ch;
}

.cp-film-panel-body {
  margin-top: 1.25rem;
  max-width: 28rem;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.cp-film-panel-meta {
  margin-top: auto;
  padding-top: 1.5rem;
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-foreground) 45%, transparent);
}

.cp-film-panel-visual {
  position: relative;
  min-height: 14rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-surface) 80%, var(--color-primary));
  border: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 10%, transparent));
}

.cp-film-panel-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cp-film-panel-visual-empty {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 1.25rem;
  min-height: 14rem;
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 700;
  line-height: 0.85;
  letter-spacing: -0.04em;
  color: color-mix(in srgb, var(--color-foreground) 12%, transparent);
}

/* Vertical colophon zone */
.cp-colophon {
  padding: clamp(4rem, 10vw, 7rem) 1.5rem;
  background: var(--color-primary, var(--color-background));
  color: var(--color-foreground);
}

.cp-colophon-inner {
  max-width: 48rem;
}

.cp-colophon-eyebrow {
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.625rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-volt, #E8FF47);
  margin: 0 0 1rem;
}

.cp-colophon-title {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  margin: 0;
}

.cp-colophon-body {
  margin-top: 1.5rem;
  max-width: 36rem;
  line-height: 1.7;
  color: var(--color-muted);
}

.cp-quote-band {
  min-height: 60svh;
  display: flex;
  align-items: center;
  padding: clamp(4rem, 10vw, 7rem) 1.5rem;
  background: var(--color-background);
  border-block: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 10%, transparent));
}

.cp-quote-band blockquote {
  max-width: 52rem;
  margin: 0;
}

.cp-quote-band p {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.5rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
}

.cp-quote-band footer {
  margin-top: 1.75rem;
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.cp-contact-slate {
  padding: clamp(4rem, 10vw, 7rem) 1.5rem;
  background: var(--color-background);
}

.cp-contact-email {
  display: inline-block;
  margin-top: 2rem;
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--color-volt, #E8FF47);
}

.cp-contact-email:hover {
  text-decoration: underline;
  text-underline-offset: 6px;
}

.cp-footer {
  padding: 3rem 1.5rem 4rem;
  background: var(--color-primary, var(--color-background));
  border-top: 1px solid var(--border-subtle, color-mix(in srgb, var(--color-foreground) 12%, transparent));
}

.cp-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.cp-footer-brand {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.cp-footer-tag {
  margin-top: 0.5rem;
  max-width: 24rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.cp-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.cp-footer nav a {
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--color-foreground) 65%, transparent);
}

.cp-footer nav a:hover {
  color: var(--color-volt, #E8FF47);
}

@media (prefers-reduced-motion: reduce) {
  .cp-filmstrip {
    scroll-behavior: auto;
  }
}
`;
}
