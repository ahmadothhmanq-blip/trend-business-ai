/** Shared TBDP component size scale. */
export type TbdpComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Interactive component visual state. */
export type TbdpComponentState = "default" | "hover" | "focus" | "active" | "disabled" | "loading";

/** Text direction — aligns with Phase 1 typography profiles. */
export type TbdpDirection = "ltr" | "rtl";

/** Base props for all TBDP components. */
export type TbdpComponentBaseProps = {
  /** BEM-style modifier class suffix */
  className?: string;
  /** Text direction override */
  dir?: TbdpDirection;
  /** Disables interaction */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** data-tbdp-component identifier */
  "data-tbdp-component"?: string;
};

export type TbdpVariantMap<T extends string> = Record<T, Record<string, string>>;

export type TbdpSizeMap = Record<TbdpComponentSize, Record<string, string>>;
