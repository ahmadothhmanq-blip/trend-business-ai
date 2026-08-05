import type { TbdpDirection } from "@/lib/design-platform/components/core/types";

/** Returns dir attribute for RTL/LTR support. */
export function resolveDir(dir?: TbdpDirection): TbdpDirection | undefined {
  return dir;
}

/** Generates a unique id for aria-labelledby/describedby. */
export function tbdpId(prefix: string, id?: string): string {
  return id ?? `tbdp-${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Standard focus ring styles using TBDP tokens. */
export const TBDP_FOCUS_RING: Record<string, string> = {
  outline: "2px solid var(--tbdp-color-border-focus)",
  outlineOffset: "2px",
};

/** Visually hidden styles for screen-reader-only text. */
export const TBDP_SR_ONLY: Record<string, string> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: "0",
};

export type TbdpA11yProps = {
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-hidden"?: boolean;
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-busy"?: boolean;
  "aria-disabled"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time";
  tabIndex?: number;
};

/** Applies disabled a11y attributes. */
export function disabledA11y(disabled?: boolean): Pick<TbdpA11yProps, "aria-disabled" | "tabIndex"> {
  if (!disabled) return {};
  return { "aria-disabled": true, tabIndex: -1 };
}

/** Live region for toast/alert announcements. */
export function liveRegionA11y(
  politeness: "polite" | "assertive" = "polite",
): Pick<TbdpA11yProps, "aria-live" | "role"> {
  return { "aria-live": politeness, role: "status" };
}
