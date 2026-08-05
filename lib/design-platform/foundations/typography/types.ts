export type TbdpTypographyRole =
  | "display"
  | "headline"
  | "title"
  | "body"
  | "label"
  | "caption";

export type TbdpTypographyProfileId =
  | "latin-ltr"
  | "latin-rtl"
  | "arabic-rtl"
  | "arabic-ltr";

export type TbdpTextDirection = "ltr" | "rtl";

export type TbdpTypographyStyle = {
  fontFamily: string;
  fontSize: string;
  lineHeight: string | number;
  fontWeight: number;
  letterSpacing: string;
};

export type TbdpTypographyScale = Record<TbdpTypographyRole, TbdpTypographyStyle>;

export type TbdpTypographyProfile = {
  id: TbdpTypographyProfileId;
  direction: TbdpTextDirection;
  localeFamily: "latin" | "arabic";
  display: TbdpTypographyStyle;
  headline: TbdpTypographyStyle;
  title: TbdpTypographyStyle;
  body: TbdpTypographyStyle;
  label: TbdpTypographyStyle;
  caption: TbdpTypographyStyle;
};

export type TbdpTypographyTokens = {
  profiles: Record<TbdpTypographyProfileId, TbdpTypographyProfile>;
  fallbacks: {
    latin: string;
    arabic: string;
    mono: string;
  };
  responsive: Record<TbdpTypographyRole, { sm: string; md: string; lg: string }>;
};
