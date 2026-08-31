/** Auto-generated from scripts/_skin-css/forest.css — do not hand-edit */
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
