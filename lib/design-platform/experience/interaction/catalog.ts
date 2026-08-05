import type {
  TbdpFeedbackState,
  TbdpInteractionBehavior,
  TbdpInteractionDomain,
} from "@/lib/design-platform/experience/core/types";

/** Official TBDP interaction behavior catalog. */
export const TBDP_INTERACTION_CATALOG: TbdpInteractionBehavior[] = [
  // Buttons
  { id: "btn-press", domain: "buttons", trigger: "pointerdown", response: "scale(0.98)", durationMs: 100, feedbackState: undefined },
  { id: "btn-hover", domain: "buttons", trigger: "pointerenter", response: "hover-lift", durationMs: 200 },
  { id: "btn-focus", domain: "buttons", trigger: "focus-visible", response: "focus-ring", durationMs: 150 },
  { id: "btn-loading", domain: "buttons", trigger: "aria-busy", response: "loading", durationMs: 0, feedbackState: "loading" },
  // Forms
  { id: "form-focus", domain: "forms", trigger: "focus", response: "focus-ring", durationMs: 150 },
  { id: "form-error", domain: "forms", trigger: "invalid", response: "error-shake", durationMs: 400, feedbackState: "error" },
  { id: "form-success", domain: "forms", trigger: "valid", response: "success-pulse", durationMs: 500, feedbackState: "success" },
  { id: "form-saving", domain: "forms", trigger: "submit", response: "saving", durationMs: 0, feedbackState: "saving" },
  // Cards
  { id: "card-hover", domain: "cards", trigger: "pointerenter", response: "card-lift", durationMs: 250 },
  { id: "card-tap", domain: "cards", trigger: "pointerdown", response: "scale(0.99)", durationMs: 100 },
  // Navigation
  { id: "nav-item-hover", domain: "navigation", trigger: "pointerenter", response: "underline-slide", durationMs: 200 },
  { id: "nav-item-active", domain: "navigation", trigger: "aria-current", response: "emphasis", durationMs: 150 },
  { id: "tab-switch", domain: "navigation", trigger: "click", response: "fade", durationMs: 200 },
  // Dialogs
  { id: "modal-open", domain: "dialogs", trigger: "open", response: "modal-enter", durationMs: 300 },
  { id: "modal-close", domain: "dialogs", trigger: "close", response: "modal-exit", durationMs: 200 },
  { id: "drawer-open", domain: "dialogs", trigger: "open", response: "drawer-slide", durationMs: 350 },
  { id: "tooltip-show", domain: "dialogs", trigger: "pointerenter", response: "tooltip-fade", durationMs: 150 },
  // Dropdowns
  { id: "dropdown-open", domain: "dropdowns", trigger: "aria-expanded", response: "scale-in", durationMs: 200 },
  // Tables
  { id: "table-row-hover", domain: "tables", trigger: "pointerenter", response: "background-subtle", durationMs: 150 },
  { id: "table-sort", domain: "tables", trigger: "click", response: "fade", durationMs: 200 },
  // Dashboard
  { id: "kpi-reveal", domain: "dashboard", trigger: "viewport", response: "scroll-reveal-up", durationMs: 600 },
  { id: "chart-load", domain: "dashboard", trigger: "mount", response: "fade-in", durationMs: 400, feedbackState: "loading" },
  // Marketing
  { id: "hero-enter", domain: "marketing", trigger: "mount", response: "hero-headline", durationMs: 800 },
  { id: "feature-stagger", domain: "marketing", trigger: "viewport", response: "grid-stagger", durationMs: 400 },
  { id: "cta-pulse", domain: "marketing", trigger: "viewport", response: "success-pulse", durationMs: 500 },
  // Commerce
  { id: "product-hover", domain: "commerce", trigger: "pointerenter", response: "card-lift", durationMs: 250 },
  { id: "cart-add", domain: "commerce", trigger: "click", response: "success-pulse", durationMs: 500, feedbackState: "success" },
  { id: "checkout-progress", domain: "commerce", trigger: "step-change", response: "progress", durationMs: 0, feedbackState: "progress" },
];

export const TBDP_INTERACTION_COUNT = TBDP_INTERACTION_CATALOG.length;

export function getInteractionsByDomain(
  domain: TbdpInteractionDomain,
): TbdpInteractionBehavior[] {
  return TBDP_INTERACTION_CATALOG.filter((b) => b.domain === domain);
}
