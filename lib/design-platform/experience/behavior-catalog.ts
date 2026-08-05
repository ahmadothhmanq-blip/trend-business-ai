/**
 * TBDP Phase 3 — Unified behavior catalog across all experience subsystems.
 */
import { TBDP_MOTION_CATALOG } from "@/lib/design-platform/experience/motion/catalog";
import { TBDP_INTERACTION_CATALOG } from "@/lib/design-platform/experience/interaction/catalog";
import { TBDP_FEEDBACK_CATALOG } from "@/lib/design-platform/experience/feedback/catalog";

export type TbdpBehaviorCatalogEntry = {
  id: string;
  subsystem: "motion" | "interaction" | "feedback" | "accessibility" | "responsive" | "direction" | "performance";
  label: string;
  configurable: boolean;
};

export const TBDP_BEHAVIOR_CATALOG: TbdpBehaviorCatalogEntry[] = [
  ...TBDP_MOTION_CATALOG.map((m) => ({
    id: m.id,
    subsystem: "motion" as const,
    label: `Motion: ${m.category}`,
    configurable: true,
  })),
  ...TBDP_INTERACTION_CATALOG.map((i) => ({
    id: i.id,
    subsystem: "interaction" as const,
    label: `Interaction: ${i.domain}`,
    configurable: true,
  })),
  ...TBDP_FEEDBACK_CATALOG.map((f) => ({
    id: f.id,
    subsystem: "feedback" as const,
    label: `Feedback: ${f.label}`,
    configurable: true,
  })),
  { id: "keyboard-nav", subsystem: "accessibility", label: "Keyboard navigation", configurable: true },
  { id: "focus-trap", subsystem: "accessibility", label: "Focus management", configurable: true },
  { id: "screen-reader", subsystem: "accessibility", label: "Screen reader announcements", configurable: true },
  { id: "reduced-motion", subsystem: "accessibility", label: "Reduced motion", configurable: true },
  { id: "touch-targets", subsystem: "accessibility", label: "Touch target sizing", configurable: true },
  { id: "viewport-mobile", subsystem: "responsive", label: "Mobile experience", configurable: true },
  { id: "viewport-tablet", subsystem: "responsive", label: "Tablet experience", configurable: true },
  { id: "viewport-desktop", subsystem: "responsive", label: "Desktop experience", configurable: true },
  { id: "input-touch", subsystem: "responsive", label: "Touch input", configurable: true },
  { id: "input-keyboard", subsystem: "responsive", label: "Keyboard input", configurable: true },
  { id: "rtl-drawer", subsystem: "direction", label: "RTL drawer direction", configurable: true },
  { id: "rtl-carousel", subsystem: "direction", label: "RTL carousel direction", configurable: true },
  { id: "rtl-motion", subsystem: "direction", label: "RTL motion axis", configurable: true },
  { id: "gpu-safe", subsystem: "performance", label: "GPU-safe animations", configurable: false },
  { id: "animation-budget", subsystem: "performance", label: "Animation budget", configurable: true },
  { id: "lazy-interactions", subsystem: "performance", label: "Lazy interactions", configurable: true },
];

export const TBDP_BEHAVIOR_COUNT = TBDP_BEHAVIOR_CATALOG.length;
