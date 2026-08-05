export type TbdpElevationLayer =
  | "base"
  | "raised"
  | "dropdown"
  | "sticky"
  | "popover"
  | "modal"
  | "toast"
  | "tooltip";

export type TbdpElevationTokens = {
  layers: Record<TbdpElevationLayer, { zIndex: number; shadow: string }>;
  hierarchy: {
    description: string;
    order: TbdpElevationLayer[];
  };
};
