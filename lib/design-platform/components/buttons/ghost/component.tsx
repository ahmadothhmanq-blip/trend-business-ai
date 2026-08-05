import type { GhostButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { ghostButtonA11yProps } from "./accessibility";

export type { GhostButtonProps } from "./types";

export function GhostButton({
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
}: GhostButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="ghost"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, ghost: true }, className)}
      {...ghostButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
