/**
 * Global TBDP component stylesheet — all rules reference Phase 1 CSS variables only.
 */
export function emitTbdpComponentStyles(): string {
  return `
/* TBDP Phase 2 — Enterprise UI Component System */
[data-tbdp-ui] { box-sizing: border-box; }
[data-tbdp-ui] *, [data-tbdp-ui] *::before, [data-tbdp-ui] *::after { box-sizing: inherit; }

.tbdp-focusable:focus-visible {
  outline: 2px solid var(--tbdp-color-border-focus);
  outline-offset: 2px;
}

/* Buttons */
.tbdp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--tbdp-spacing-xs);
  font-family: var(--tbdp-font-body);
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  text-decoration: none;
}
.tbdp-btn:disabled, .tbdp-btn[aria-disabled="true"] { opacity: var(--tbdp-opacity-medium); cursor: not-allowed; }
.tbdp-btn--xs { min-height: 1.75rem; padding: var(--tbdp-spacing-xs) var(--tbdp-spacing-sm); font-size: 0.75rem; border-radius: var(--tbdp-radius-sm); }
.tbdp-btn--sm { min-height: 2rem; padding: var(--tbdp-spacing-xs) var(--tbdp-spacing-md); font-size: 0.8125rem; border-radius: var(--tbdp-radius-sm); }
.tbdp-btn--md { min-height: 2.5rem; padding: var(--tbdp-spacing-sm) var(--tbdp-spacing-lg); font-size: 0.875rem; border-radius: var(--tbdp-radius-md); }
.tbdp-btn--lg { min-height: 3rem; padding: var(--tbdp-spacing-md) var(--tbdp-spacing-xl); font-size: 1rem; border-radius: var(--tbdp-radius-md); }
.tbdp-btn--xl { min-height: 3.5rem; padding: var(--tbdp-spacing-md) var(--tbdp-spacing-2xl); font-size: 1.0625rem; border-radius: var(--tbdp-radius-lg); }
.tbdp-btn--primary { background: var(--tbdp-color-primary); color: var(--tbdp-color-text-inverse); }
.tbdp-btn--secondary { background: var(--tbdp-color-surface-raised); color: var(--tbdp-color-text-primary); border-color: var(--tbdp-color-border-default); }
.tbdp-btn--ghost { background: transparent; color: var(--tbdp-color-text-primary); }
.tbdp-btn--outline { background: transparent; color: var(--tbdp-color-primary); border-color: var(--tbdp-color-border-strong); }
.tbdp-btn--floating { border-radius: var(--tbdp-radius-pill); box-shadow: var(--tbdp-shadow-3); }

/* Forms */
.tbdp-input, .tbdp-textarea, .tbdp-select {
  width: 100%;
  font-family: var(--tbdp-font-body);
  color: var(--tbdp-color-text-primary);
  background: var(--tbdp-color-surface-base);
  border: 1px solid var(--tbdp-color-border-default);
  border-radius: var(--tbdp-radius-md);
  padding: var(--tbdp-spacing-sm) var(--tbdp-spacing-md);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.tbdp-input:focus, .tbdp-textarea:focus, .tbdp-select:focus {
  outline: none;
  border-color: var(--tbdp-color-border-focus);
  box-shadow: 0 0 0 3px var(--tbdp-color-overlay-highlight);
}
.tbdp-input:disabled, .tbdp-textarea:disabled { color: var(--tbdp-color-text-disabled); background: var(--tbdp-color-background-subtle); }

/* Cards */
.tbdp-card {
  background: var(--tbdp-color-surface-base);
  border: 1px solid var(--tbdp-color-border-subtle);
  border-radius: var(--tbdp-radius-lg);
  box-shadow: var(--tbdp-shadow-1);
  overflow: hidden;
}
.tbdp-card__body { padding: var(--tbdp-spacing-lg); }

/* Feedback */
.tbdp-alert { padding: var(--tbdp-spacing-md) var(--tbdp-spacing-lg); border-radius: var(--tbdp-radius-md); border-inline-start: 4px solid; }
.tbdp-alert--info { background: var(--tbdp-color-overlay-highlight); border-color: var(--tbdp-color-info); color: var(--tbdp-color-text-primary); }
.tbdp-alert--success { border-color: var(--tbdp-color-success); }
.tbdp-alert--warning { border-color: var(--tbdp-color-warning); }
.tbdp-alert--danger { border-color: var(--tbdp-color-danger); }
.tbdp-skeleton { background: linear-gradient(90deg, var(--tbdp-color-background-subtle) 25%, var(--tbdp-color-surface-raised) 50%, var(--tbdp-color-background-subtle) 75%); background-size: 200% 100%; animation: tbdp-shimmer 1.5s infinite; border-radius: var(--tbdp-radius-sm); }
@keyframes tbdp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Layout */
.tbdp-container { width: 100%; margin-inline: auto; padding-inline: var(--tbdp-spacing-lg); max-width: var(--tbdp-container-xl); }
.tbdp-section { padding-block: var(--tbdp-spacing-3xl); }
.tbdp-stack { display: flex; flex-direction: column; }
.tbdp-stack--sm { gap: var(--tbdp-spacing-sm); }
.tbdp-stack--md { gap: var(--tbdp-spacing-md); }
.tbdp-stack--lg { gap: var(--tbdp-spacing-lg); }
.tbdp-grid { display: grid; gap: var(--tbdp-spacing-lg); }
.tbdp-divider { border: 0; border-block-start: 1px solid var(--tbdp-color-border-subtle); margin: 0; }

/* Navigation */
.tbdp-navbar { display: flex; align-items: center; justify-content: space-between; padding: var(--tbdp-spacing-md) var(--tbdp-spacing-lg); background: var(--tbdp-color-surface-base); border-block-end: 1px solid var(--tbdp-color-border-subtle); }
.tbdp-tabs { display: flex; gap: var(--tbdp-spacing-xs); border-block-end: 1px solid var(--tbdp-color-border-subtle); }
.tbdp-tab { padding: var(--tbdp-spacing-sm) var(--tbdp-spacing-md); color: var(--tbdp-color-text-secondary); background: none; border: none; cursor: pointer; border-block-end: 2px solid transparent; }
.tbdp-tab[aria-selected="true"] { color: var(--tbdp-color-primary); border-block-end-color: var(--tbdp-color-primary); }

/* Dialogs */
.tbdp-modal-overlay { position: fixed; inset: 0; background: var(--tbdp-color-overlay-scrim); z-index: 400; display: flex; align-items: center; justify-content: center; padding: var(--tbdp-spacing-lg); }
.tbdp-modal { background: var(--tbdp-color-surface-base); border-radius: var(--tbdp-radius-lg); box-shadow: var(--tbdp-shadow-4); max-width: 32rem; width: 100%; max-height: 90vh; overflow: auto; }
.tbdp-drawer { position: fixed; inset-block: 0; inset-inline-end: 0; width: min(24rem, 100vw); background: var(--tbdp-color-surface-base); box-shadow: var(--tbdp-shadow-4); z-index: 400; }

/* RTL */
[dir="rtl"] .tbdp-alert { border-inline-start: none; border-inline-end: 4px solid; }

/* Responsive */
@media (max-width: 639px) {
  .tbdp-container { padding-inline: var(--tbdp-spacing-md); }
  .tbdp-grid--responsive { grid-template-columns: 1fr; }
}
@media (min-width: 640px) {
  .tbdp-grid--responsive { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .tbdp-grid--responsive { grid-template-columns: repeat(3, 1fr); }
}
`.trim();
}
