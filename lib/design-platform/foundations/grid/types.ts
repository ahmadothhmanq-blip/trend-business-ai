export type TbdpBreakpointName = "mobile" | "tablet" | "desktop";

export type TbdpContainerWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export type TbdpGridTokens = {
  breakpoints: Record<TbdpBreakpointName, { minWidth: string; maxWidth?: string }>;
  containers: Record<TbdpContainerWidth, string>;
  columns: Record<TbdpBreakpointName, number>;
  gutters: Record<TbdpBreakpointName, string>;
  safeAreas: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  maxWidths: {
    content: string;
    prose: string;
    wide: string;
  };
};
