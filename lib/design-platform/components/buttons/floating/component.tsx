import type { FloatingButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { floatingButtonA11yProps } from "./accessibility";

export type { FloatingButtonProps } from "./types";

export function FloatingButton({
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
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="floating"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, primary: true, floating: true }, className)}
      {...floatingButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
