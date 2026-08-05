import type { SecondaryButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { secondaryButtonA11yProps } from "./accessibility";

export type { SecondaryButtonProps } from "./types";

export function SecondaryButton({
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
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="secondary"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, secondary: true }, className)}
      {...secondaryButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
