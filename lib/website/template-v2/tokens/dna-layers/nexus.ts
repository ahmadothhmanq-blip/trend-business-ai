/** Auto-generated from scripts/_skin-css/nexus.css — do not hand-edit */
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
