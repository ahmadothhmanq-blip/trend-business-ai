export type TbdpSpacingKey =
  | "micro"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";

export type TbdpSpacingScale = Record<TbdpSpacingKey, string>;

export type TbdpSpacingSemantic = {
  component: {
    gapTight: string;
    gapDefault: string;
    gapRelaxed: string;
    paddingInline: string;
    paddingBlock: string;
  };
  layout: {
    gutter: string;
    margin: string;
    gap: string;
    stack: string;
  };
  section: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

export type TbdpSpacingTokens = {
  unit: string;
  scale: TbdpSpacingScale;
  semantic: TbdpSpacingSemantic;
};
