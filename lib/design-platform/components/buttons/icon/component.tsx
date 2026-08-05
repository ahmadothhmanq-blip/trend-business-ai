import type { IconButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { iconButtonA11yProps } from "./accessibility";

export type { IconButtonProps } from "./types";

export function IconButton({
  size = "md",
  dir,
  className,
  children,
  title,
  description,
  label,
  disabled,
  loading,
  
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="icon"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, ghost: true }, className)}
      {...iconButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
