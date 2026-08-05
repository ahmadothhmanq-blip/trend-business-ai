import type { PrimaryButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { primaryButtonA11yProps } from "./accessibility";

export type { PrimaryButtonProps } from "./types";

export function PrimaryButton({
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
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="primary"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, primary: true }, className)}
      {...primaryButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
