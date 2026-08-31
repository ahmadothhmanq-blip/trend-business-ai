/** Consolidated DNA-lock CSS layers - generated */

export function buildHeritageDnaCss(): string {
  return `/* heritage — education-premium — EDITORIAL MAGAZINE DNA (.ed-*) */

.ed-paper {
  background-color: var(--color-background);
  background-image:
    radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 42%),
    linear-gradient(180deg, color-mix(in srgb, var(--color-foreground) 2.5%, transparent), transparent 28%);
  color: var(--color-foreground);
}

.ed-font-display { font-family: var(--font-display), "EB Garamond", Georgia, "Times New Roman", serif; }
.ed-font-body { font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif; }
.ed-font-mono { font-family: "DM Mono", ui-monospace, monospace; }

.ed-eyebrow {
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.ed-headline-sm {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.85rem, 3.2vw, 2.75rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  max-width: 22ch;
}

.ed-body {
  margin-top: 0.85rem;
  max-width: 42rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-muted);
}

.ed-metric {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
}

.ed-btn-primary,
.ed-btn-secondary {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

.ed-btn-primary {
  background: var(--color-primary);
  color: var(--color-background);
  border: 1px solid var(--color-primary);
}

.ed-btn-primary:hover { transform: translateY(-1px); }

.ed-btn-secondary {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid color-mix(in srgb, var(--color-foreground) 28%, transparent);
}

.ed-btn-secondary:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.ed-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.ed-input,
.ed-textarea {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent);
  background: color-mix(in srgb, var(--color-surface) 70%, var(--color-background));
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
  color: var(--color-foreground);
}

.ed-input:focus-visible,
.ed-textarea:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.ed-rule {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-foreground) 35%, transparent),
    transparent
  );
}

.ed-section-head { margin-bottom: 2.5rem; }
.ed-section-head-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem 2rem;
}

/* Masthead */
.ed-masthead {
  border-bottom: 2px solid color-mix(in srgb, var(--color-foreground) 55%, transparent);
  padding: 0.75rem clamp(1.25rem, 4vw, 2.5rem) 0;
}

.ed-masthead-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.ed-masthead-subscribe {
  font-weight: 600;
  color: var(--color-foreground);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ed-masthead-brand {
  padding: 1.35rem 0 1rem;
  text-align: center;
}

.ed-masthead-title {
  display: inline-block;
  font-size: clamp(2.4rem, 7vw, 4.5rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-decoration: none;
  color: var(--color-foreground);
}

.ed-masthead-tagline {
  margin-top: 0.45rem;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--color-muted);
}

.ed-masthead-depts {
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent);
  border-bottom: 3px double color-mix(in srgb, var(--color-foreground) 45%, transparent);
}

.ed-masthead-dept-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.15rem 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ed-masthead-dept-link {
  display: block;
  padding: 0.7rem 1.1rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
}

.ed-masthead-dept-link:hover { color: var(--color-accent); }

.ed-masthead-mobile-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0 0.85rem;
}

.ed-masthead-menu-btn {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 22%, transparent);
  background: transparent;
}

.ed-masthead-mobile {
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent);
  padding: 0.75rem 0 1rem;
}

.ed-masthead-mobile ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.ed-masthead-mobile a {
  display: block;
  padding: 0.4rem 0;
  text-decoration: none;
  color: var(--color-foreground);
  font-weight: 600;
}

/* Cover story hero */
.ed-cover { padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.25rem, 4vw, 2.5rem) clamp(3rem, 7vw, 5rem); }
.ed-cover-inner { max-width: 52rem; margin-inline: auto; }
.ed-cover-kicker { margin-bottom: 1rem; }
.ed-cover-headline {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(2.6rem, 7vw, 4.75rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.035em;
  max-width: 16ch;
}
.ed-cover-deck {
  margin-top: 1.35rem;
  max-width: 40rem;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.65;
  color: var(--color-muted);
}
.ed-cover-byline {
  margin-top: 1.1rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-foreground) 62%, transparent);
}
.ed-cover-pull {
  margin: 2rem 0 0;
  padding: 1.25rem 0 1.25rem 1.25rem;
  border-left: 3px solid var(--color-accent);
  max-width: 36rem;
}
.ed-cover-pull p {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.2rem, 2.4vw, 1.55rem);
  font-style: italic;
  line-height: 1.45;
}
.ed-cover-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
.ed-cover-figure { margin: 2.5rem 0 0; }
.ed-cover-image { width: 100%; max-height: 28rem; object-fit: cover; display: block; }
.ed-cover-caption {
  margin-top: 0.55rem;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* Departments / multi-column */
.ed-departments,
.ed-essay,
.ed-by-numbers,
.ed-pullquotes,
.ed-campus-notes,
.ed-programs,
.ed-faq,
.ed-letters,
.ed-utility,
.ed-colophon,
.ed-section-shell,
.ed-footer {
  padding: clamp(3rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.5rem);
}

.ed-departments-inner,
.ed-essay-inner,
.ed-by-numbers-inner,
.ed-pullquotes-inner,
.ed-campus-notes-inner,
.ed-programs-inner,
.ed-faq-inner,
.ed-letters-inner,
.ed-utility-inner,
.ed-colophon-inner,
.ed-section-shell-inner,
.ed-footer-inner {
  max-width: 72rem;
  margin-inline: auto;
}

.ed-columns {
  display: grid;
  gap: 2rem 1.75rem;
  column-gap: 2rem;
}

@media (min-width: 720px) {
  .ed-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1100px) {
  .ed-columns { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.ed-column-article {
  padding-top: 1rem;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 22%, transparent);
}

.ed-column-index {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  color: var(--color-accent);
}

.ed-column-title {
  margin-top: 0.55rem;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.2;
}

.ed-column-body {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.ed-column-link {
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 3px;
  color: var(--color-foreground);
}

/* Essay */
.ed-essay-layout {
  display: grid;
  gap: 2rem;
}

@media (min-width: 900px) {
  .ed-essay-layout { grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr); align-items: start; }
}

.ed-essay-dropcap::first-letter {
  float: left;
  font-family: var(--font-display), Georgia, serif;
  font-size: 3.6rem;
  line-height: 0.8;
  padding-right: 0.45rem;
  padding-top: 0.2rem;
  color: var(--color-accent);
}

.ed-essay-notes {
  margin: 1.75rem 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.ed-essay-notes li {
  padding-left: 1rem;
  border-left: 2px solid var(--color-accent);
  font-size: 0.95rem;
  line-height: 1.5;
}

.ed-essay-aside {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 18%, transparent);
  padding: 2rem 1.5rem;
  text-align: center;
}

.ed-essay-aside p {
  font-size: clamp(1.4rem, 2.5vw, 1.9rem);
  font-style: italic;
  line-height: 1.3;
}

.ed-essay-figure img,
.ed-essay-image {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 26rem;
}

.ed-essay-figure figcaption {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}

/* By the numbers */
.ed-by-numbers-sub { margin: 0; max-width: 24rem; }
.ed-by-numbers-row {
  display: grid;
  gap: 1.5rem;
  margin: 1.75rem 0;
}

@media (min-width: 720px) {
  .ed-by-numbers-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem 2rem;
  }
}

.ed-by-numbers-item {
  padding-right: 1rem;
  border-right: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
}

.ed-by-numbers-item:last-child { border-right: 0; }
.ed-by-numbers-label { margin-top: 0.55rem; font-weight: 600; font-size: 0.92rem; }
.ed-by-numbers-detail { margin-top: 0.25rem; font-size: 0.75rem; color: var(--color-muted); }

/* Pull quotes */
.ed-pullquotes-stack { display: grid; gap: 2.5rem; }
.ed-pullquote {
  margin: 0;
  padding: 0 0 0 1.5rem;
  border-left: 3px solid var(--color-accent);
  max-width: 48rem;
}
.ed-pullquote blockquote p {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.45rem, 3vw, 2.1rem);
  font-style: italic;
  line-height: 1.35;
}
.ed-pullquote-name { display: block; margin-top: 1rem; font-weight: 700; font-size: 0.9rem; }
.ed-pullquote-meta { display: block; margin-top: 0.2rem; font-size: 0.8rem; color: var(--color-muted); }

/* Campus notes */
.ed-notes-list { list-style: none; margin: 0; padding: 0; }
.ed-note-row {
  display: grid;
  gap: 0.75rem 1.5rem;
  padding: 1.5rem 0;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
}
@media (min-width: 800px) {
  .ed-note-row { grid-template-columns: 9rem minmax(0, 1fr) auto; align-items: start; }
}
.ed-note-dept {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.ed-note-tag {
  margin-top: 0.35rem;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.ed-note-title { font-size: 1.35rem; font-weight: 600; }
.ed-note-detail { margin-top: 0.45rem; color: var(--color-muted); line-height: 1.6; }
.ed-note-image { width: 7.5rem; height: 5.5rem; object-fit: cover; }

/* Programs of study */
.ed-programs-list { list-style: none; margin: 0; padding: 0; }
.ed-program-row {
  display: grid;
  gap: 1rem;
  padding: 1.75rem 0;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
}
@media (min-width: 900px) {
  .ed-program-row {
    grid-template-columns: 3.5rem minmax(0, 1fr) auto;
    align-items: start;
  }
}
.ed-program-row.is-featured { background: color-mix(in srgb, var(--color-accent) 6%, transparent); padding-inline: 1rem; }
.ed-program-index { color: var(--color-accent); font-size: 0.85rem; letter-spacing: 0.08em; }
.ed-program-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
}
.ed-program-name { font-size: 1.5rem; font-weight: 600; }
.ed-program-price {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.ed-program-desc { margin-top: 0.55rem; color: var(--color-muted); line-height: 1.6; }
.ed-program-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0.85rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}
.ed-program-features li::before {
  content: "·";
  margin-right: 0.45rem;
  color: var(--color-accent);
}

/* FAQ */
.ed-faq-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.75rem; }
.ed-faq-item {
  display: grid;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
}
@media (min-width: 700px) {
  .ed-faq-item { grid-template-columns: 3rem minmax(0, 1fr); }
}
.ed-faq-num { color: var(--color-accent); }
.ed-faq-q { font-size: 1.25rem; font-weight: 600; }
.ed-faq-a { margin-top: 0.45rem; color: var(--color-muted); line-height: 1.65; }

/* Letters desk */
.ed-letters-layout {
  display: grid;
  gap: 2rem;
}
@media (min-width: 900px) {
  .ed-letters-layout { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.35fr); }
}
.ed-letters-meta {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
  align-content: start;
}
.ed-letters-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 0.25rem;
}
.ed-letters-meta a { color: var(--color-foreground); text-decoration: underline; text-underline-offset: 3px; }
.ed-letters-form { display: grid; gap: 1rem; }
.ed-letters-grid {
  display: grid;
  gap: 1rem;
}
@media (min-width: 640px) {
  .ed-letters-grid { grid-template-columns: 1fr 1fr; }
}
.ed-letters-field { display: grid; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; }

/* Utility */
.ed-utility {
  border-top: 2px solid color-mix(in srgb, var(--color-foreground) 35%, transparent);
  border-bottom: 2px solid color-mix(in srgb, var(--color-foreground) 35%, transparent);
}
.ed-utility-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem 2rem;
  align-items: end;
}
.ed-utility-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }

/* Colophon */
.ed-colophon-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}
.ed-colophon-list li {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.65rem 0;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  font-size: 0.9rem;
}
.ed-colophon-cat { color: var(--color-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }

/* Footer */
.ed-footer {
  border-top: 3px double color-mix(in srgb, var(--color-foreground) 40%, transparent);
  padding-block: 2.5rem;
}
.ed-footer-title { font-size: 1.5rem; font-weight: 700; }
.ed-footer-tagline { margin-top: 0.4rem; color: var(--color-muted); font-size: 0.9rem; }
.ed-footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  margin-top: 1.5rem;
}
.ed-footer-nav a {
  font-size: 0.8rem;
  text-decoration: none;
  color: var(--color-muted);
}
.ed-footer-nav a:hover { color: var(--color-foreground); }
.ed-footer-copy { margin-top: 1.5rem; font-size: 0.75rem; color: var(--color-muted); }

/* Motion hooks (paired with FlagshipRevealInit) */
.ed-reveal:not(.df-reveal-js) {
  animation: ed-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-timeline: view();
  animation-range: entry 5% cover 30%;
}
.ed-reveal-stagger:not(.df-reveal-js) > * {
  animation: ed-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-timeline: view();
  animation-range: entry 5% cover 35%;
}
.ed-reveal-stagger:not(.df-reveal-js) > *:nth-child(2) { animation-delay: 60ms; }
.ed-reveal-stagger:not(.df-reveal-js) > *:nth-child(3) { animation-delay: 120ms; }
.ed-reveal-stagger:not(.df-reveal-js) > *:nth-child(4) { animation-delay: 180ms; }

@keyframes ed-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ed-reveal,
  .ed-reveal-stagger > * {
    animation: none !important;
  }
}
`;
}

export function buildAtelierDnaCss(): string {
  return `/* atelier — ecommerce-premium — PRODUCT RUNWAY DNA (.ec-*) */

.ec-font-display { font-family: var(--font-display), "Playfair Display", Georgia, serif; }
.ec-font-body { font-family: var(--font-body), "Manrope", system-ui, sans-serif; }
.ec-font-mono { font-family: ui-monospace, "JetBrains Mono", monospace; }

.ec-eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.ec-headline-sm {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.9rem, 3.5vw, 2.8rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  max-width: 18ch;
}

.ec-body {
  margin-top: 0.85rem;
  max-width: 36rem;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.ec-section-head { margin-bottom: 2rem; }

.ec-btn-primary,
.ec-btn-secondary {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.ec-btn-primary {
  background: var(--color-primary);
  color: var(--color-background);
  border: 1px solid var(--color-primary);
}

.ec-btn-primary:hover { transform: translateY(-1px); }

.ec-btn-secondary {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid color-mix(in srgb, var(--color-foreground) 28%, transparent);
}

.ec-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.ec-input,
.ec-textarea {
  width: 100%;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 22%, transparent);
  background: transparent;
  padding: 0.7rem 0;
  font-size: 0.95rem;
  color: var(--color-foreground);
}

.ec-input:focus-visible,
.ec-textarea:focus-visible {
  outline: none;
  border-bottom-color: var(--color-accent);
}

/* Minimal wordmark nav */
.ec-wordmark-nav {
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 30;
  mix-blend-mode: difference;
  color: #fff;
}

.ec-wordmark-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem clamp(1rem, 3vw, 2rem);
}

.ec-wordmark {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
}

.ec-wordmark-links {
  display: flex;
  gap: 1.5rem;
}

.ec-wordmark-links a,
.ec-wordmark-cta,
.ec-wordmark-menu {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

.ec-wordmark-mobile {
  padding: 0 1rem 1rem;
  background: color-mix(in srgb, var(--color-background) 92%, transparent);
  color: var(--color-foreground);
  mix-blend-mode: normal;
}

.ec-wordmark-mobile ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.ec-wordmark-mobile a { color: inherit; text-decoration: none; font-size: 0.9rem; }

/* Full-bleed product stage */
.ec-stage {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.ec-stage-plane {
  position: relative;
  flex: 1;
  min-height: calc(100svh - 7.5rem);
  overflow: hidden;
}

.ec-stage-plane.is-tonal {
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 88%, #000), color-mix(in srgb, var(--color-accent) 35%, var(--color-primary))),
    radial-gradient(circle at 70% 40%, color-mix(in srgb, var(--color-accent) 28%, transparent), transparent 55%);
}

.ec-stage-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ec-stage-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 35%, color-mix(in srgb, #000 55%, transparent) 100%);
  pointer-events: none;
}

.ec-stage-overlay {
  position: absolute;
  inset-inline: clamp(1rem, 4vw, 3rem);
  bottom: 6.5rem;
  z-index: 2;
  color: #fff;
  max-width: 40rem;
}

.ec-stage-brand {
  font-size: 0.75rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  opacity: 0.85;
}

.ec-stage-product {
  margin-top: 0.75rem;
  font-size: clamp(2.4rem, 7vw, 4.5rem);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.03em;
  max-width: 14ch;
}

.ec-stage-deck {
  margin-top: 0.9rem;
  max-width: 32rem;
  font-size: 1rem;
  line-height: 1.55;
  color: color-mix(in srgb, #fff 78%, transparent);
}

/* Sticky purchase rail */
.ec-purchase-rail {
  position: sticky;
  bottom: 0;
  z-index: 40;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  background: color-mix(in srgb, var(--color-background) 92%, transparent);
  backdrop-filter: blur(12px);
}

.ec-purchase-rail-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.85rem clamp(1rem, 3vw, 2rem);
}

.ec-purchase-name {
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.05rem;
}

.ec-purchase-price {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.ec-purchase-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

/* Slim ticker under rail */
.ec-ticker {
  overflow: hidden;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  background: var(--color-surface);
}

.ec-ticker-track {
  display: flex;
  width: max-content;
  gap: 2.5rem;
  padding: 0.55rem 0;
  animation: ec-marquee 28s linear infinite;
}

.ec-ticker-item {
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
  white-space: nowrap;
}

.ec-ticker-item::before {
  content: "·";
  margin-right: 2.5rem;
  color: var(--color-accent);
}

@keyframes ec-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.ec-slim-ticker {
  padding: 0.85rem clamp(1rem, 3vw, 2rem);
  border-block: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
}

.ec-slim-ticker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  margin: 0;
}

.ec-slim-ticker-item dd {
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.25rem;
  margin: 0;
}

.ec-slim-ticker-item dt {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* Lookbook horizontal strip */
.ec-lookbook { padding: clamp(2.5rem, 6vw, 4rem) 0; }
.ec-lookbook-head { padding-inline: clamp(1rem, 3vw, 2rem); margin-bottom: 1.5rem; }

.ec-lookbook-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(16rem, 78vw);
  gap: 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 clamp(1rem, 3vw, 2rem) 1rem;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 900px) {
  .ec-lookbook-strip { grid-auto-columns: minmax(20rem, 28vw); }
}

.ec-lookbook-frame {
  scroll-snap-align: start;
  display: grid;
  gap: 0.75rem;
}

.ec-lookbook-media {
  aspect-ratio: 3 / 4;
  width: 100%;
  object-fit: cover;
  display: block;
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
}

.ec-lookbook-media.is-tonal {
  display: grid;
  place-items: center;
  color: var(--color-accent);
  font-size: 1.5rem;
}

.ec-lookbook-caption h3 {
  font-size: 1.2rem;
  font-weight: 500;
}

.ec-lookbook-caption p {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: var(--color-muted);
  line-height: 1.5;
}

/* Products rail */
.ec-products,
.ec-story,
.ec-voices,
.ec-tiers,
.ec-faq,
.ec-contact,
.ec-utility,
.ec-makers,
.ec-section-shell,
.ec-footer {
  padding: clamp(3rem, 7vw, 5rem) clamp(1rem, 3vw, 2rem);
}

.ec-products-inner,
.ec-story-inner,
.ec-voices-inner,
.ec-tiers-inner,
.ec-faq-inner,
.ec-contact-inner,
.ec-utility-inner,
.ec-makers-inner,
.ec-section-shell-inner,
.ec-footer-inner {
  max-width: 80rem;
  margin-inline: auto;
}

.ec-products-rail {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(14rem, 70vw);
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.5rem;
}

@media (min-width: 900px) {
  .ec-products-rail {
    grid-auto-flow: unset;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    overflow: visible;
  }
}

.ec-product-tile { scroll-snap-align: start; }
.ec-product-media {
  aspect-ratio: 4 / 5;
  width: 100%;
  object-fit: cover;
  display: block;
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
}
.ec-product-media.is-tonal { min-height: 12rem; }
.ec-product-meta { margin-top: 0.85rem; }
.ec-product-cat {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.ec-product-meta h3 { margin-top: 0.3rem; font-size: 1.2rem; font-weight: 500; }
.ec-product-detail { margin-top: 0.35rem; font-size: 0.85rem; color: var(--color-muted); line-height: 1.5; }
.ec-product-price { margin-top: 0.55rem; font-size: 0.8rem; letter-spacing: 0.06em; }

/* Atelier story */
.ec-story-inner {
  display: grid;
  gap: 2rem;
}
@media (min-width: 900px) {
  .ec-story-inner { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); align-items: stretch; }
}
.ec-story-points {
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.65rem;
}
.ec-story-points li {
  padding-left: 1rem;
  border-left: 2px solid var(--color-accent);
  font-size: 0.95rem;
}
.ec-story-figure {
  margin: 0;
  min-height: 18rem;
  background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
}
.ec-story-figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  min-height: 18rem;
}

/* Voices */
.ec-voices-strip {
  display: grid;
  gap: 1.5rem;
}
@media (min-width: 800px) {
  .ec-voices-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.ec-voice {
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
}
.ec-voice blockquote p {
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.15rem;
  font-style: italic;
  line-height: 1.4;
}
.ec-voice figcaption {
  margin-top: 1rem;
  display: grid;
  gap: 0.2rem;
  font-size: 0.8rem;
}
.ec-voice figcaption span:last-child { color: var(--color-muted); }

/* Collection tiers */
.ec-tiers-list { list-style: none; margin: 0; padding: 0; }
.ec-tier-row {
  display: grid;
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent);
}
@media (min-width: 900px) {
  .ec-tier-row { grid-template-columns: 3rem minmax(0, 1fr) auto; align-items: center; }
}
.ec-tier-row.is-featured { background: color-mix(in srgb, var(--color-accent) 7%, transparent); padding-inline: 1rem; }
.ec-tier-row h3 { font-size: 1.5rem; font-weight: 500; }
.ec-tier-price { margin-top: 0.25rem; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.8rem; color: var(--color-muted); }
.ec-tier-desc { margin-top: 0.55rem; color: var(--color-muted); }
.ec-tier-row ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

/* FAQ / contact / utility / footer */
.ec-faq-list { display: grid; gap: 1.25rem; }
.ec-faq-item { padding-bottom: 1.25rem; border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent); }
.ec-faq-item dt { font-family: var(--font-display), Georgia, serif; font-size: 1.2rem; }
.ec-faq-item dd { margin: 0.45rem 0 0; color: var(--color-muted); line-height: 1.6; }

.ec-contact-layout {
  display: grid;
  gap: 2rem;
}
@media (min-width: 800px) {
  .ec-contact-layout { grid-template-columns: 0.8fr 1.2fr; }
}
.ec-contact-meta { display: grid; gap: 0.75rem; align-content: start; }
.ec-contact-meta a { color: var(--color-foreground); }
.ec-contact-form { display: grid; gap: 1rem; }
.ec-contact-form label { display: grid; gap: 0.35rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; }

.ec-utility-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: end;
}
.ec-utility-actions { display: flex; flex-wrap: wrap; gap: 0.65rem; }

.ec-makers-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}
.ec-makers-list li {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.65rem 0;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  font-size: 0.9rem;
}

.ec-footer {
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent);
  padding-block: 2rem;
}
.ec-footer-brand {
  font-size: 0.95rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
.ec-footer-tag { margin-top: 0.4rem; color: var(--color-muted); font-size: 0.9rem; }
.ec-footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  margin-top: 1.25rem;
}
.ec-footer-nav a {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-muted);
}
.ec-footer-copy { margin-top: 1.25rem; font-size: 0.75rem; color: var(--color-muted); }

.ec-reveal:not(.df-reveal-js) {
  animation: ec-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-timeline: view();
  animation-range: entry 5% cover 30%;
}
.ec-reveal-stagger:not(.df-reveal-js) > * {
  animation: ec-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-timeline: view();
  animation-range: entry 5% cover 35%;
}
.ec-reveal-stagger:not(.df-reveal-js) > *:nth-child(2) { animation-delay: 50ms; }
.ec-reveal-stagger:not(.df-reveal-js) > *:nth-child(3) { animation-delay: 100ms; }
.ec-reveal-stagger:not(.df-reveal-js) > *:nth-child(4) { animation-delay: 150ms; }

@keyframes ec-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ec-reveal,
  .ec-reveal-stagger > *,
  .ec-ticker-track {
    animation: none !important;
  }
}
`;
}

export function buildNexusDnaCss(): string {
  return `/* nexus — saas-enterprise — APP SHELL DNA (.se-*) */

.se-font-display { font-family: var(--font-display), "Syne", system-ui, sans-serif; }
.se-font-body { font-family: var(--font-body), "DM Sans", system-ui, sans-serif; }
.se-font-mono { font-family: "JetBrains Mono", ui-monospace, monospace; }

.se-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.se-headline-sm {
  font-family: var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.6rem, 2.8vw, 2.25rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  max-width: 28ch;
}

.se-body {
  margin-top: 0.7rem;
  max-width: 42rem;
  font-size: 0.98rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.se-metric {
  font-family: var(--font-display), system-ui, sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.se-docs-inner {
  max-width: 78rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 1.75rem);
}

.se-docs-head { margin-bottom: 1.75rem; }

.se-btn-primary,
.se-btn-secondary {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  font-weight: 650;
  text-decoration: none;
  border-radius: 0.45rem;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.se-btn-primary {
  background: var(--color-primary);
  color: var(--color-background);
  border: 1px solid var(--color-primary);
}

.se-btn-primary:hover { transform: translateY(-1px); }

.se-btn-secondary {
  background: var(--color-surface);
  color: var(--color-foreground);
  border: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
}

.se-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.se-input,
.se-textarea {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
  background: var(--color-surface);
  border-radius: 0.45rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  color: var(--color-foreground);
}

.se-input:focus-visible,
.se-textarea:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

/* App topbar */
.se-app-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  background: color-mix(in srgb, var(--color-background) 92%, transparent);
  backdrop-filter: blur(10px);
}

.se-app-topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 90rem;
  margin-inline: auto;
  padding: 0.65rem clamp(0.85rem, 2vw, 1.25rem);
}

.se-app-topbar-left { display: flex; align-items: center; gap: 0.75rem; }
.se-app-mark {
  font-weight: 760;
  text-decoration: none;
  color: var(--color-foreground);
}
.se-app-env {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  color: var(--color-accent);
}
.se-app-topbar-nav { display: flex; gap: 0.25rem; }
.se-app-topbar-nav a {
  padding: 0.4rem 0.7rem;
  border-radius: 0.4rem;
  font-size: 0.82rem;
  text-decoration: none;
  color: var(--color-muted);
}
.se-app-topbar-nav a:hover {
  background: color-mix(in srgb, var(--color-foreground) 5%, transparent);
  color: var(--color-foreground);
}
.se-app-topbar-right { display: flex; align-items: center; gap: 0.5rem; }
.se-app-menu-btn {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 16%, transparent);
  background: var(--color-surface);
  border-radius: 0.4rem;
  padding: 0.4rem 0.7rem;
  font-size: 0.8rem;
}
.se-app-mobile {
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  padding: 0.75rem 1rem 1rem;
}
.se-app-mobile ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.se-app-mobile a { color: var(--color-foreground); text-decoration: none; font-size: 0.9rem; }

/* App shell first viewport */
.se-appshell {
  background: color-mix(in srgb, var(--color-foreground) 4%, var(--color-background));
  padding: 0.75rem clamp(0.75rem, 2vw, 1.25rem) 1.5rem;
}

.se-appshell-frame {
  display: grid;
  gap: 0.75rem;
  max-width: 90rem;
  margin-inline: auto;
  min-height: calc(100svh - 4.5rem);
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.85rem;
  overflow: hidden;
  background: var(--color-background);
}

@media (min-width: 960px) {
  .se-appshell-frame {
    grid-template-columns: 14.5rem minmax(0, 1fr);
  }
}

.se-appshell-sidebar {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.85rem;
  background: color-mix(in srgb, var(--color-foreground) 3.5%, var(--color-surface));
  border-right: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
}

@media (min-width: 960px) {
  .se-appshell-sidebar { display: flex; }
}

.se-appshell-side-brand {
  font-size: 0.95rem;
  font-weight: 760;
  padding: 0.35rem 0.5rem;
}

.se-appshell-side-nav {
  display: grid;
  gap: 0.2rem;
}

.se-appshell-side-nav a {
  padding: 0.55rem 0.65rem;
  border-radius: 0.45rem;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--color-muted);
}

.se-appshell-side-nav a.is-active,
.se-appshell-side-nav a:hover {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-foreground);
}

.se-appshell-side-meta {
  margin-top: auto;
  padding: 0.75rem 0.5rem 0.25rem;
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  font-size: 0.72rem;
  color: var(--color-muted);
  display: grid;
  gap: 0.25rem;
}

.se-appshell-canvas {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  min-width: 0;
}

.se-appshell-canvas-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
}

.se-appshell-title {
  margin-top: 0.4rem;
  font-size: clamp(1.35rem, 2.4vw, 1.9rem);
  font-weight: 740;
  line-height: 1.2;
  max-width: 28ch;
}

.se-appshell-deck {
  margin-top: 0.45rem;
  max-width: 40rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--color-muted);
}

.se-appshell-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.se-appshell-panels {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 800px) {
  .se-appshell-panels { grid-template-columns: 1.4fr 0.8fr; }
}

.se-panel {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.65rem;
  background: var(--color-surface);
  overflow: hidden;
}

.se-panel-chrome {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.se-chart-bars {
  display: flex;
  align-items: end;
  gap: 0.45rem;
  height: 8.5rem;
  padding: 0.85rem 0.9rem 1rem;
}

.se-chart-bars span {
  flex: 1;
  border-radius: 0.25rem 0.25rem 0 0;
  background: linear-gradient(180deg, var(--color-accent), color-mix(in srgb, var(--color-primary) 70%, var(--color-accent)));
  opacity: 0.85;
}

.se-panel-kpi { padding-bottom: 1rem; }
.se-kpi-value {
  padding: 1.1rem 0.9rem 0.2rem;
  font-family: var(--font-display), system-ui, sans-serif;
  font-size: 2.4rem;
  font-weight: 760;
  letter-spacing: -0.04em;
}
.se-kpi-label {
  padding: 0 0.9rem;
  font-size: 0.8rem;
  color: var(--color-muted);
}

.se-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.se-table th,
.se-table td {
  padding: 0.65rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 8%, transparent);
}

.se-table th {
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  font-weight: 650;
}

.se-pill {
  display: inline-flex;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 650;
}

.se-pill-strong { background: color-mix(in srgb, #059669 18%, transparent); color: #047857; }
.se-pill-watch { background: color-mix(in srgb, #d97706 18%, transparent); color: #b45309; }
.se-pill-critical { background: color-mix(in srgb, #dc2626 16%, transparent); color: #b91c1c; }

/* Dense product-docs sections */
.se-modules,
.se-brief,
.se-telemetry,
.se-notes,
.se-cases,
.se-plans,
.se-faq,
.se-support,
.se-utility,
.se-connectors,
.se-section-shell,
.se-footer {
  padding-block: clamp(2.5rem, 6vw, 4.25rem);
}

.se-module-grid {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 800px) {
  .se-module-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1100px) {
  .se-module-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.se-module-card {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.65rem;
  background: var(--color-surface);
  padding: 0.85rem;
}

.se-module-chrome {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.se-module-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
}

.se-module-card p {
  margin-top: 0.45rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--color-muted);
}

.se-module-link {
  display: inline-block;
  margin-top: 0.85rem;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--color-accent);
  text-decoration: none;
}

.se-brief-layout {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 900px) {
  .se-brief-layout { grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.85fr); }
}

.se-brief-list {
  margin: 1.25rem 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.55rem;
}

.se-brief-list li {
  padding: 0.65rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  border-radius: 0.45rem;
  font-size: 0.9rem;
  background: var(--color-surface);
}

.se-brief-aside {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.65rem;
  padding: 1rem;
  background: var(--color-surface);
}

.se-brief-aside-label {
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
}

.se-brief-aside dl { display: grid; gap: 0.75rem; margin: 0; }
.se-brief-aside dt { font-size: 0.72rem; color: var(--color-muted); }
.se-brief-aside dd { margin: 0.15rem 0 0; font-weight: 650; }
.se-brief-image {
  margin-top: 1rem;
  width: 100%;
  border-radius: 0.45rem;
  display: block;
  object-fit: cover;
  max-height: 10rem;
}

.se-telemetry-grid {
  display: grid;
  gap: 0.65rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 900px) {
  .se-telemetry-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.se-telemetry-cell {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.55rem;
  padding: 0.9rem;
  background: var(--color-surface);
}

.se-telemetry-label { margin-top: 0.35rem; font-size: 0.85rem; font-weight: 650; }
.se-telemetry-detail { margin-top: 0.2rem; font-size: 0.72rem; color: var(--color-muted); }

.se-notes-list { display: grid; gap: 0.75rem; }
@media (min-width: 900px) {
  .se-notes-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.se-note {
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.55rem;
  padding: 0.95rem;
  background: var(--color-surface);
}

.se-note blockquote p { font-size: 0.95rem; line-height: 1.55; }
.se-note figcaption {
  margin-top: 0.85rem;
  display: grid;
  gap: 0.15rem;
  font-size: 0.78rem;
}
.se-note figcaption span { color: var(--color-muted); }

.se-cases-table-wrap,
.se-plans-matrix-wrap {
  overflow-x: auto;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.65rem;
  background: var(--color-surface);
}

.se-cases-table,
.se-plans-matrix {
  width: 100%;
  min-width: 40rem;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.se-cases-table th,
.se-cases-table td,
.se-plans-matrix th,
.se-plans-matrix td {
  padding: 0.75rem 0.85rem;
  text-align: left;
  border-bottom: 1px solid color-mix(in srgb, var(--color-foreground) 8%, transparent);
  vertical-align: top;
}

.se-cases-table th,
.se-plans-matrix thead th {
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.se-plans-matrix .se-plan-name { display: block; font-size: 0.95rem; font-weight: 740; color: var(--color-foreground); text-transform: none; letter-spacing: 0; }
.se-plans-matrix .se-plan-price { display: block; margin: 0.35rem 0 0.65rem; font-size: 0.9rem; color: var(--color-foreground); text-transform: none; letter-spacing: 0; }
.se-plans-matrix th.is-featured { background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
.se-plans-matrix tbody th { font-weight: 650; color: var(--color-foreground); text-transform: none; letter-spacing: 0; font-size: 0.85rem; }

.se-faq-list { display: grid; gap: 0.75rem; }
.se-faq-item {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.55rem;
  padding: 0.9rem 1rem;
  background: var(--color-surface);
}
.se-faq-item dt { font-weight: 700; }
.se-faq-item dd { margin: 0.4rem 0 0; color: var(--color-muted); line-height: 1.55; }

.se-support-layout {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 850px) {
  .se-support-layout { grid-template-columns: 0.75fr 1.25fr; }
}
.se-support-meta {
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.55rem;
  padding: 1rem;
  background: var(--color-surface);
  display: grid;
  gap: 0.65rem;
  align-content: start;
}
.se-support-meta a { color: var(--color-foreground); }
.se-support-form {
  display: grid;
  gap: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.55rem;
  padding: 1rem;
  background: var(--color-surface);
}
.se-support-form label { display: grid; gap: 0.35rem; font-size: 0.75rem; font-weight: 650; }

.se-utility-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  border-radius: 0.65rem;
  padding: 1.25rem;
  background: var(--color-surface);
}
.se-utility-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.se-connectors-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}
.se-connectors-list li {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  gap: 0.85rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  border-radius: 0.45rem;
  background: var(--color-surface);
  font-size: 0.88rem;
}

.se-footer {
  border-top: 1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent);
  background: color-mix(in srgb, var(--color-foreground) 3%, var(--color-background));
}
.se-footer-inner { display: grid; gap: 1rem; }
.se-footer-brand { font-size: 1.1rem; font-weight: 760; }
.se-footer-tag { margin-top: 0.3rem; color: var(--color-muted); font-size: 0.9rem; }
.se-footer-nav { display: flex; flex-wrap: wrap; gap: 0.65rem 1rem; }
.se-footer-nav a { font-size: 0.82rem; color: var(--color-muted); text-decoration: none; }
.se-footer-copy { font-size: 0.75rem; color: var(--color-muted); }

.se-reveal:not(.df-reveal-js) {
  animation: se-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-timeline: view();
  animation-range: entry 5% cover 30%;
}
.se-reveal-stagger:not(.df-reveal-js) > * {
  animation: se-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-timeline: view();
  animation-range: entry 5% cover 35%;
}
.se-reveal-stagger:not(.df-reveal-js) > *:nth-child(2) { animation-delay: 40ms; }
.se-reveal-stagger:not(.df-reveal-js) > *:nth-child(3) { animation-delay: 80ms; }
.se-reveal-stagger:not(.df-reveal-js) > *:nth-child(4) { animation-delay: 120ms; }

@keyframes se-rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .se-reveal,
  .se-reveal-stagger > * {
    animation: none !important;
  }
}
`;
}

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

export function buildEstatesDnaCss(): string {
  return `/* Estates — real-estate-premium — PROPERTY DOSSIER DNA (.rep-*) */

.rep-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--color-background) 92%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
}

.rep-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 88rem;
  margin-inline: auto;
  padding: 0.85rem 1.25rem;
}

.rep-nav-brand {
  font-family: var(--font-display), Georgia, serif;
  font-size: 0.8125rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
}

.rep-nav-links {
  display: none;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .rep-nav-links {
    display: flex;
  }
}

.rep-nav-links a {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--color-foreground) 70%, transparent);
}

.rep-nav-links a:hover {
  color: var(--color-accent);
}

/* Hero = search utility + featured dossier opener (not marketing theatre) */
.rep-dossier-opener {
  display: grid;
  gap: 0;
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  background: var(--color-background);
}

@media (min-width: 1024px) {
  .rep-dossier-opener {
    grid-template-columns: minmax(16rem, 0.95fr) minmax(0, 1.35fr);
    min-height: min(88svh, 52rem);
  }
}

.rep-dossier-search {
  padding: 2rem 1.25rem 2.5rem;
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
  background: var(--color-surface);
}

@media (min-width: 1024px) {
  .rep-dossier-search {
    border-bottom: 0;
    border-inline-end: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
    padding: 2.5rem 1.75rem;
  }
}

.rep-dossier-search-label {
  font-size: 0.625rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0 0 1rem;
}

.rep-dossier-search form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rep-dossier-search input,
.rep-dossier-search select {
  width: 100%;
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 14%, transparent));
  background: var(--color-background);
  color: var(--color-foreground);
  padding: 0.75rem 0.9rem;
  font-size: 0.875rem;
}

.rep-dossier-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.rep-dossier-filters button {
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 14%, transparent));
  background: transparent;
  color: var(--color-foreground);
  padding: 0.45rem 0.75rem;
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.rep-dossier-filters button:hover,
.rep-dossier-filters button[aria-pressed="true"] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.rep-dossier-featured {
  padding: 2rem 1.25rem 2.5rem;
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .rep-dossier-featured {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    padding: 2.5rem 2rem;
    align-items: start;
  }
}

.rep-dossier-featured-visual {
  position: relative;
  min-height: 16rem;
  background: color-mix(in srgb, var(--color-surface) 70%, var(--color-primary));
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
  overflow: hidden;
}

.rep-dossier-featured-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  min-height: 16rem;
}

.rep-dossier-featured-visual-empty {
  min-height: 16rem;
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: color-mix(in srgb, var(--color-foreground) 14%, transparent);
}

.rep-dossier-sheet {
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  background: var(--color-background);
  padding: 1.25rem 1.35rem 1.5rem;
}

.rep-dossier-sheet-ref {
  font-family: var(--font-mono, ui-monospace), monospace;
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin: 0 0 0.75rem;
}

.rep-dossier-sheet h1,
.rep-dossier-sheet h2 {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
}

.rep-dossier-sheet-deck {
  margin: 0.85rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-muted);
}

.rep-spec-list {
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
}

.rep-spec-list > div {
  display: grid;
  grid-template-columns: minmax(6rem, 0.4fr) minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 8%, transparent));
}

.rep-spec-list dt {
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0;
}

.rep-spec-list dd {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-foreground);
}

/* Amenities / features as specs */
.rep-amenities {
  padding: clamp(3.5rem, 8vw, 5.5rem) 1.25rem;
  background: var(--color-background);
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
}

.rep-amenities-inner {
  max-width: 56rem;
  margin-inline: auto;
}

.rep-amenities-title {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 500;
  margin: 0 0 1.5rem;
}

/* Listings split: index | dossier */
.rep-listings {
  display: grid;
  gap: 0;
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
  background: var(--color-background);
  min-height: 28rem;
}

@media (min-width: 1024px) {
  .rep-listings {
    grid-template-columns: minmax(15rem, 0.85fr) minmax(0, 1.45fr);
  }
}

.rep-listings-index {
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
  background: var(--color-surface);
}

@media (min-width: 1024px) {
  .rep-listings-index {
    border-bottom: 0;
    border-inline-end: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
    position: sticky;
    top: 3.5rem;
    align-self: start;
    max-height: calc(100svh - 3.5rem);
    overflow-y: auto;
  }
}

.rep-listings-index-head {
  padding: 1.25rem 1.25rem 0.75rem;
  font-size: 0.625rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.rep-listing-row {
  display: block;
  width: 100%;
  text-align: start;
  border: 0;
  border-top: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 8%, transparent));
  background: transparent;
  color: inherit;
  padding: 1rem 1.25rem;
  cursor: pointer;
}

.rep-listing-row:hover,
.rep-listing-row[aria-current="true"] {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.rep-listing-row-title {
  font-family: var(--font-display), Georgia, serif;
  font-size: 1rem;
  margin: 0;
}

.rep-listing-row-meta {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.rep-listings-detail {
  padding: 1.5rem 1.25rem 2.5rem;
}

@media (min-width: 768px) {
  .rep-listings-detail {
    padding: 2rem 2rem 3rem;
  }
}

.rep-listings-detail-visual {
  position: relative;
  min-height: 14rem;
  margin-bottom: 1.25rem;
  overflow: hidden;
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
  background: color-mix(in srgb, var(--color-surface) 70%, var(--color-primary));
}

.rep-listings-detail-visual img {
  width: 100%;
  height: 100%;
  min-height: 14rem;
  object-fit: cover;
  display: block;
}

.rep-section-plain {
  padding: clamp(3.5rem, 8vw, 5.5rem) 1.25rem;
  background: var(--color-background);
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 8%, transparent));
}

.rep-section-plain-inner {
  max-width: 56rem;
  margin-inline: auto;
}

.rep-stats-sheet {
  margin: 1.5rem 0 0;
  padding: 0;
}

.rep-stats-sheet > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 8%, transparent));
}

.rep-stats-sheet dt {
  margin: 0;
  font-size: 0.875rem;
}

.rep-stats-sheet dd {
  margin: 0;
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.25rem;
}

.rep-testimonial-sheet {
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 12%, transparent));
  padding: 1.75rem;
  background: var(--color-surface);
}

.rep-testimonial-sheet p {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.15rem, 2.4vw, 1.65rem);
  line-height: 1.35;
  margin: 0;
}

.rep-testimonial-sheet footer {
  margin-top: 1.25rem;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.rep-agency-programs {
  margin: 1.5rem 0 0;
  padding: 0;
}

.rep-agency-programs > div {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) auto;
  gap: 1rem;
  align-items: baseline;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 8%, transparent));
}

.rep-agency-programs dt {
  margin: 0;
}

.rep-agency-programs dt strong {
  display: block;
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.05rem;
  font-weight: 500;
}

.rep-agency-programs dt span {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.rep-agency-programs dd {
  margin: 0;
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.15rem;
  white-space: nowrap;
}

.rep-contact-sheet {
  max-width: 36rem;
  margin-inline: auto;
}

.rep-contact-sheet form {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.rep-contact-sheet input,
.rep-contact-sheet textarea {
  width: 100%;
  border: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 14%, transparent));
  background: var(--color-background);
  color: var(--color-foreground);
  padding: 0.75rem 0.9rem;
  font-size: 0.875rem;
}

.rep-footer {
  padding: 2.5rem 1.25rem 3rem;
  background: var(--color-surface);
  border-top: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 10%, transparent));
}

.rep-footer-grid {
  max-width: 88rem;
  margin-inline: auto;
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .rep-footer-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.rep-footer-grid p:first-child {
  font-family: var(--font-display), Georgia, serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8125rem;
  margin: 0;
}

.rep-footer-meta {
  max-width: 88rem;
  margin: 2rem auto 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-default, color-mix(in srgb, var(--color-foreground) 8%, transparent));
  font-size: 0.75rem;
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
}

`;
}

export function buildForestDnaCss(): string {
  return `/* Forest — restaurant-signature — TASTING MENU SPINE overrides (.rs-*)
   Do not duplicate emit-design-tokens; these classes extend the paper/ink document. */

.rs-menu-doc {
  max-width: 42rem;
  margin-inline: auto;
  padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem clamp(3.5rem, 8vw, 5.5rem);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-linen, #FFFCF7) 92%, var(--color-surface)), var(--color-background));
  color: var(--color-foreground);
  border-block: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
}

.rs-menu-nav {
  border-bottom: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 35%, transparent);
  background: color-mix(in srgb, var(--color-linen, #FFFCF7) 88%, var(--color-background));
}

.rs-menu-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 42rem;
  margin-inline: auto;
  padding: 0.9rem 1.25rem;
}

.rs-menu-nav-brand {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: var(--color-foreground);
}

.rs-menu-nav-links {
  display: none;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .rs-menu-nav-links {
    display: flex;
  }
}

.rs-menu-nav-links a {
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--color-foreground) 65%, transparent);
}

.rs-menu-nav-links a:hover {
  color: var(--color-copper, #D4A574);
}

/* Hero = menu header (establishment, service, season) */
.rs-menu-header {
  text-align: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 30%, transparent);
}

.rs-menu-header-service {
  font-size: 0.625rem;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: var(--color-copper, #D4A574);
  margin: 0 0 1.25rem;
}

.rs-menu-header-name {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(2.25rem, 6vw, 3.75rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;
}

.rs-menu-header-season {
  margin: 1rem 0 0;
  font-family: var(--font-body), "Literata", Georgia, serif;
  font-style: italic;
  font-size: 1.05rem;
  color: color-mix(in srgb, var(--color-foreground) 62%, transparent);
}

.rs-menu-header-rule {
  width: 3.5rem;
  height: 1px;
  margin: 1.5rem auto 0;
  background: var(--color-copper, #D4A574);
}

.rs-menu-header-note {
  margin: 1.5rem auto 0;
  max-width: 28rem;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-foreground) 68%, transparent);
}

.rs-menu-header-actions {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

/* Courses = numbered tasting menu rows */
.rs-menu-courses {
  padding-top: 2.5rem;
}

.rs-menu-section-label {
  font-size: 0.625rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-copper, #D4A574);
  text-align: center;
  margin: 0 0 1.75rem;
}

.rs-course {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  gap: 0.75rem 1rem;
  align-items: start;
  padding: 1.15rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 18%, transparent);
}

.rs-course-num {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.15rem;
  font-variant-numeric: lining-nums;
  color: var(--color-copper, #D4A574);
  line-height: 1.2;
}

.rs-course-title {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.15rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.25;
}

.rs-course-note {
  margin: 0.4rem 0 0;
  font-family: var(--font-body), "Literata", Georgia, serif;
  font-size: 0.875rem;
  font-style: italic;
  line-height: 1.55;
  color: color-mix(in srgb, var(--color-foreground) 58%, transparent);
}

.rs-course-price {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 0.95rem;
  white-space: nowrap;
  color: var(--color-foreground);
}

/* Cellar / portfolio notes */
.rs-cellar {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
}

.rs-cellar-item {
  padding: 1rem 0;
  border-bottom: 1px dashed color-mix(in srgb, var(--color-copper, #D4A574) 22%, transparent);
}

.rs-cellar-item h3 {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
}

.rs-cellar-item p {
  margin: 0.4rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-foreground) 62%, transparent);
}

.rs-cellar-meta {
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-copper, #D4A574);
}

.rs-menu-essay {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
}

.rs-menu-essay h2 {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400;
  margin: 0 0 1rem;
  text-align: center;
}

.rs-menu-essay p {
  font-family: var(--font-body), "Literata", Georgia, serif;
  font-size: 1rem;
  line-height: 1.8;
  color: color-mix(in srgb, var(--color-foreground) 70%, transparent);
  margin: 0 auto;
  max-width: 36rem;
  text-align: center;
}

.rs-menu-quotes {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
}

.rs-menu-quote {
  text-align: center;
  padding: 1.25rem 0;
}

.rs-menu-quote blockquote {
  margin: 0;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.15rem, 2.4vw, 1.5rem);
  font-style: italic;
  line-height: 1.4;
}

.rs-menu-quote figcaption {
  margin-top: 0.85rem;
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.rs-menu-faq {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
}

.rs-menu-faq details {
  padding: 0.9rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 16%, transparent);
}

.rs-menu-faq summary {
  cursor: pointer;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.05rem;
  list-style: none;
}

.rs-menu-faq summary::-webkit-details-marker {
  display: none;
}

.rs-menu-faq p {
  margin: 0.65rem 0 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: color-mix(in srgb, var(--color-foreground) 62%, transparent);
}

.rs-menu-reserve {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
  text-align: center;
}

.rs-menu-reserve h2 {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400;
  margin: 0 0 0.75rem;
}

.rs-menu-reserve form {
  display: grid;
  gap: 0.65rem;
  max-width: 22rem;
  margin: 1.25rem auto 0;
  text-align: start;
}

.rs-menu-reserve input {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 35%, transparent);
  background: color-mix(in srgb, var(--color-linen, #FFFCF7) 70%, transparent);
  color: var(--color-foreground);
  padding: 0.7rem 0.85rem;
  font-size: 0.875rem;
}

.rs-menu-footer {
  max-width: 42rem;
  margin-inline: auto;
  padding: 2.5rem 1.25rem 3.5rem;
  text-align: center;
  border-top: 1px solid color-mix(in srgb, var(--color-copper, #D4A574) 28%, transparent);
  background: color-mix(in srgb, var(--color-linen, #FFFCF7) 80%, var(--color-surface));
}

.rs-menu-footer-brand {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.15rem;
  margin: 0;
}

.rs-menu-footer-tag {
  margin: 0.5rem 0 0;
  font-style: italic;
  font-size: 0.9rem;
  color: color-mix(in srgb, var(--color-foreground) 58%, transparent);
}

.rs-menu-footer nav {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.rs-menu-footer nav a {
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--color-foreground) 55%, transparent);
}

.rs-menu-footer nav a:hover {
  color: var(--color-copper, #D4A574);
}

`;
}

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

export function buildCitadelDnaCss(): string {
  return `/* Citadel Trust — SEAL / TRUST STACK DNA (.ct-*) */

@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap");

@keyframes ct-reveal-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ct-seal-settle {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .ct-reveal, .ct-reveal-stagger > *, .ct-btn-primary, .ct-btn-secondary, .ct-seal {
    animation: none !important;
    transition: none !important;
  }
  .ct-reveal, .ct-reveal-stagger > *, .ct-seal {
    opacity: 1 !important;
    transform: none !important;
  }
}

.ct-font-display { font-family: "Cormorant Garamond", var(--font-display), Georgia, serif; }
.ct-font-body { font-family: "Source Sans 3", var(--font-body), system-ui, sans-serif; }
.ct-font-mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }

.ct-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent, #B45309);
}

.ct-headline {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(2.5rem, 6vw, 4.25rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.02;
  color: var(--color-foreground);
  text-wrap: balance;
}

.ct-headline-sm {
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.1;
  color: var(--color-foreground);
}

.ct-body {
  font-family: "Source Sans 3", var(--font-body), system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--color-muted);
}

.ct-btn-primary,
.ct-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.75rem 1.5rem;
  font-family: "Source Sans 3", var(--font-body), system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 0;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.ct-btn-primary {
  color: #fff;
  background: var(--color-primary, #1C1917);
  border: 1px solid var(--color-primary, #1C1917);
}
.ct-btn-primary:hover {
  background: color-mix(in srgb, var(--color-primary) 85%, #fff);
}

.ct-btn-secondary {
  color: var(--color-foreground);
  background: transparent;
  border: 1px solid var(--border-default);
}
.ct-btn-secondary:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.ct-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent, #B45309);
  outline-offset: 3px;
}

.ct-section { padding-block: clamp(4rem, 9vw, 6.5rem); }
.ct-section-alt {
  background: color-mix(in srgb, var(--color-surface) 92%, var(--color-background));
}

.ct-dossier {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 96%, #d6d3d1) 0%, var(--color-background) 100%);
}

.ct-seal {
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 50%;
  border: 2px solid var(--color-accent, #B45309);
  display: grid;
  place-items: center;
  margin-inline: auto;
  background:
    radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 62%),
    var(--color-surface);
  box-shadow: inset 0 0 0 6px color-mix(in srgb, var(--color-accent) 22%, transparent);
  animation: ct-seal-settle 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ct-seal-inner {
  width: 5.25rem;
  height: 5.25rem;
  border-radius: 50%;
  border: 1px dashed var(--color-accent, #B45309);
  display: grid;
  place-items: center;
  text-align: center;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary, #1C1917);
  line-height: 1.15;
}

.ct-credential {
  font-family: "Source Sans 3", system-ui, sans-serif;
  font-size: 0.9375rem;
  letter-spacing: 0.02em;
  color: var(--color-muted);
  text-wrap: balance;
}

/* Stacked credential documents */
.ct-doc {
  position: relative;
  border: 1px solid var(--border-default);
  background: var(--color-surface);
  padding: clamp(1.5rem, 3vw, 2.25rem);
  box-shadow:
    0 1px 0 color-mix(in srgb, var(--color-foreground) 6%, transparent),
    0 18px 40px -28px color-mix(in srgb, var(--color-foreground) 35%, transparent);
}
.ct-doc + .ct-doc {
  margin-top: 1.25rem;
}
.ct-doc-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.ct-doc-seal-mark {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
}

.ct-article {
  border-top: 1px solid var(--border-subtle);
  padding-block: 1.35rem;
}
.ct-article:first-of-type { border-top: 0; padding-top: 0; }
.ct-article-num {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.ct-article-title {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0.35rem;
  color: var(--color-foreground);
}

.ct-attestation {
  border: 1px solid var(--border-default);
  background: var(--color-background);
  padding: 1.5rem 1.35rem;
}
.ct-attestation-seal {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-accent);
  display: grid;
  place-items: center;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: 1rem;
}

.ct-letter {
  border: 1px solid var(--border-default);
  background: var(--color-surface);
  padding: 1.75rem 1.5rem;
}
.ct-letter-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.ct-reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
.ct-reveal.df-is-visible,
.ct-reveal.ct-is-visible,
.ct-reveal.is-visible { opacity: 1; transform: none; }
.ct-reveal-stagger > * { opacity: 0; transform: translateY(14px); transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1); }
.ct-reveal-stagger.df-is-visible > *,
.ct-reveal-stagger.ct-is-visible > *,
.ct-reveal-stagger.is-visible > *,
.ct-reveal.df-is-visible .ct-reveal-stagger > * { opacity: 1; transform: none; }
.ct-reveal-stagger > *:nth-child(1) { transition-delay: 0.05s; }
.ct-reveal-stagger > *:nth-child(2) { transition-delay: 0.12s; }
.ct-reveal-stagger > *:nth-child(3) { transition-delay: 0.19s; }
.ct-reveal-stagger > *:nth-child(4) { transition-delay: 0.26s; }
.ct-reveal-stagger > *:nth-child(5) { transition-delay: 0.33s; }
.ct-reveal-stagger > *:nth-child(6) { transition-delay: 0.4s; }

.ct-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  backdrop-filter: blur(10px);
}
.ct-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 88rem;
  margin-inline: auto;
  min-height: 4rem;
  padding-inline: 1.25rem;
}
@media (min-width: 640px) {
  .ct-nav-inner { padding-inline: 2rem; }
}
.ct-nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-foreground);
}
.ct-nav-crest {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-accent);
  display: grid;
  place-items: center;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-accent);
}
.ct-nav-name {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.ct-nav-links {
  display: none;
  gap: 1.75rem;
}
@media (min-width: 1024px) {
  .ct-nav-links { display: flex; }
}
.ct-nav-links a {
  font-family: "Source Sans 3", system-ui, sans-serif;
  font-size: 0.875rem;
  text-decoration: none;
  color: var(--color-muted);
}
.ct-nav-links a:hover { color: var(--color-foreground); }
`;
}

export function buildLuminaDnaCss(): string {
  return `/* Lumina Wellness — ATMOSPHERE BREATH DNA (.lu-*) */

@import url("https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600&display=swap");

@keyframes lu-breathe {
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.06); opacity: 0.8; }
}
@keyframes lu-orb-drift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(2%, -3%, 0); }
}
@keyframes lu-reveal-soft {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .lu-reveal, .lu-reveal-stagger > *, .lu-orb, .lu-btn-primary, .lu-btn-secondary, .lu-atmosphere::before {
    animation: none !important;
    transition: none !important;
  }
  .lu-reveal, .lu-reveal-stagger > * {
    opacity: 1 !important;
    transform: none !important;
  }
}

.lu-font-display { font-family: "Cormorant", var(--font-display), Georgia, serif; }
.lu-font-body { font-family: "Manrope", var(--font-body), system-ui, sans-serif; }

.lu-eyebrow {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-accent, #7C9A92) 90%, var(--color-foreground));
}

.lu-headline {
  font-family: "Cormorant", var(--font-display), Georgia, serif;
  font-size: clamp(2.75rem, 7vw, 5rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.02;
  color: var(--color-foreground);
  text-wrap: balance;
}

.lu-headline-sm {
  font-family: "Cormorant", var(--font-display), Georgia, serif;
  font-size: clamp(1.85rem, 4vw, 3rem);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.12;
  color: var(--color-foreground);
}

.lu-body {
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--color-muted);
  font-weight: 400;
}

.lu-metric {
  font-family: "Cormorant", var(--font-display), Georgia, serif;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 500;
  color: var(--color-accent, #7C9A92);
  line-height: 1;
}

.lu-btn-primary,
.lu-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.8rem 1.6rem;
  font-family: "Manrope", var(--font-body), system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 9999px;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.25s ease;
}

.lu-btn-primary {
  color: #fff;
  background: color-mix(in srgb, var(--color-primary, #4A6A62) 92%, #000);
  border: 1px solid transparent;
}
.lu-btn-primary:hover {
  transform: translateY(-1px);
  background: var(--color-accent, #7C9A92);
}

.lu-btn-secondary {
  color: var(--color-foreground);
  background: color-mix(in srgb, var(--color-surface) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  backdrop-filter: blur(8px);
}
.lu-btn-secondary:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.lu-focus-ring:focus-visible {
  outline: 2px solid var(--color-accent, #7C9A92);
  outline-offset: 3px;
}

.lu-section {
  padding-block: clamp(5rem, 14vw, 9rem);
  position: relative;
}

.lu-atmosphere {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100svh;
  display: flex;
  align-items: center;
  background:
    radial-gradient(ellipse 80% 60% at 50% 20%, color-mix(in srgb, var(--color-accent, #7C9A92) 22%, transparent), transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 80%, color-mix(in srgb, var(--color-primary, #4A6A62) 14%, transparent), transparent 65%),
    linear-gradient(180deg, var(--color-background), color-mix(in srgb, var(--color-surface) 70%, var(--color-background)));
}
.lu-atmosphere::before {
  content: "";
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 42%),
    radial-gradient(circle at 70% 60%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 45%);
  animation: lu-orb-drift 18s ease-in-out infinite;
  z-index: -1;
}

.lu-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
  animation: lu-breathe 10s ease-in-out infinite;
  background: color-mix(in srgb, var(--color-accent, #7C9A92) 28%, transparent);
}
.lu-orb-a { width: 18rem; height: 18rem; top: 12%; inset-inline-start: 8%; }
.lu-orb-b { width: 14rem; height: 14rem; bottom: 18%; inset-inline-end: 12%; animation-delay: -4s; }

.lu-quiet-nav {
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 40;
  background: transparent;
}
.lu-quiet-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 48rem;
  margin-inline: auto;
  min-height: 4.5rem;
  padding-inline: 1.25rem;
}
.lu-quiet-nav-brand {
  font-family: "Cormorant", Georgia, serif;
  font-size: 1.35rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: var(--color-foreground);
}
.lu-quiet-nav-links {
  display: none;
  gap: 1.75rem;
}
@media (min-width: 1024px) {
  .lu-quiet-nav-links { display: flex; }
}
.lu-quiet-nav-links a {
  font-family: "Manrope", system-ui, sans-serif;
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-muted);
}
.lu-quiet-nav-links a:hover { color: var(--color-foreground); }
.lu-quiet-nav-cta {
  font-family: "Manrope", system-ui, sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-accent);
  border-bottom: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  padding-bottom: 0.15rem;
}

/* Ritual sequence — sparse vertical steps, not cards */
.lu-ritual {
  max-width: 36rem;
  margin-inline: auto;
}
.lu-ritual-step {
  position: relative;
  padding-block: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
}
.lu-ritual-step + .lu-ritual-step::before {
  content: "";
  position: absolute;
  top: 0;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 2.5rem;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--color-accent) 55%, transparent), transparent);
}
.lu-ritual-index {
  display: inline-grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: 1.25rem;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  font-family: "Cormorant", Georgia, serif;
  font-size: 1rem;
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-surface) 60%, transparent);
}
.lu-ritual-title {
  font-family: "Cormorant", Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 500;
  color: var(--color-foreground);
}

.lu-soft-quote {
  max-width: 34rem;
  margin-inline: auto;
  text-align: center;
  padding-block: clamp(2rem, 5vw, 3.5rem);
}
.lu-soft-quote blockquote {
  font-family: "Cormorant", Georgia, serif;
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  font-style: italic;
  line-height: 1.45;
  color: var(--color-foreground);
}

.lu-membership {
  max-width: 28rem;
  margin-inline: auto;
  text-align: center;
  padding-block: clamp(2rem, 5vw, 3rem);
  border-top: 1px solid color-mix(in srgb, var(--color-accent) 22%, transparent);
}
.lu-membership:first-of-type { border-top: 0; }

.lu-reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1); }
.lu-reveal.df-is-visible,
.lu-reveal.lu-is-visible,
.lu-reveal.is-visible { opacity: 1; transform: none; }
.lu-reveal-stagger > * { opacity: 0; transform: translateY(14px); transition: opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1); }
.lu-reveal-stagger.df-is-visible > *,
.lu-reveal-stagger.lu-is-visible > *,
.lu-reveal-stagger.is-visible > *,
.lu-reveal.df-is-visible .lu-reveal-stagger > * { opacity: 1; transform: none; }
.lu-reveal-stagger > *:nth-child(1) { transition-delay: 0.06s; }
.lu-reveal-stagger > *:nth-child(2) { transition-delay: 0.14s; }
.lu-reveal-stagger > *:nth-child(3) { transition-delay: 0.22s; }
.lu-reveal-stagger > *:nth-child(4) { transition-delay: 0.3s; }
.lu-reveal-stagger > *:nth-child(5) { transition-delay: 0.38s; }
.lu-reveal-stagger > *:nth-child(6) { transition-delay: 0.46s; }
`;
}

