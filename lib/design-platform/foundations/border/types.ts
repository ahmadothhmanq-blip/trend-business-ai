export type TbdpBorderWidthKey = "none" | "hairline" | "thin" | "medium" | "thick";

export type TbdpBorderStyleKey = "solid" | "dashed" | "dotted";

export type TbdpBorderTokens = {
  width: Record<TbdpBorderWidthKey, string>;
  style: Record<TbdpBorderStyleKey, string>;
};

export type TbdpDividerTokens = {
  horizontal: string;
  vertical: string;
  inset: string;
};
