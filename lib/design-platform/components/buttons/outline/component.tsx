import type { OutlineButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { outlineButtonA11yProps } from "./accessibility";

export type { OutlineButtonProps } from "./types";

export function OutlineButton({
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
}: OutlineButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="outline"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, outline: true }, className)}
      {...outlineButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
