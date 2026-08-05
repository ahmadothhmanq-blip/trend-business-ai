export type TbdpIconSizeKey = "xs" | "sm" | "md" | "lg" | "xl";

export type TbdpIconTokens = {
  size: Record<TbdpIconSizeKey, string>;
  spacing: {
    inline: string;
    block: string;
    touchTarget: string;
  };
  stroke: {
    thin: string;
    regular: string;
    bold: string;
  };
  usage: {
    minContrastRatio: number;
    decorativeOpacity: number;
    interactivePadding: string;
  };
};
