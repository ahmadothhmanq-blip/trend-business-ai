/** Supported color modes for semantic token resolution. */
export type TbdpColorMode = "light" | "dark";

/** Named opacity steps used by semantic color tokens. */
export type TbdpOpacityStep =
  | "transparent"
  | "subtle"
  | "muted"
  | "soft"
  | "medium"
  | "strong"
  | "opaque";

export type TbdpColorPrimitiveScale = Record<string, string>;

export type TbdpColorPrimitives = {
  brand: TbdpColorPrimitiveScale;
  neutral: TbdpColorPrimitiveScale;
  success: TbdpColorPrimitiveScale;
  warning: TbdpColorPrimitiveScale;
  danger: TbdpColorPrimitiveScale;
  info: TbdpColorPrimitiveScale;
};

export type TbdpSemanticColorGroup = {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  surface: {
    base: string;
    raised: string;
    overlay: string;
    sunken: string;
    inverse: string;
  };
  background: {
    canvas: string;
    subtle: string;
    emphasis: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
    focus: string;
    inverse: string;
  };
  overlay: {
    scrim: string;
    scrimStrong: string;
    backdrop: string;
    highlight: string;
  };
};

export type TbdpSemanticColorTokens = Record<TbdpColorMode, TbdpSemanticColorGroup>;

export type TbdpOpacityTokens = Record<TbdpOpacityStep, number>;
