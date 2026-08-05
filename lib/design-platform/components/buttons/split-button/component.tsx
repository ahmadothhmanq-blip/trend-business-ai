"use client";

import type { SplitButtonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { splitButtonA11yProps } from "./accessibility";

export type { SplitButtonProps } from "./types";

export function SplitButton({
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
}: SplitButtonProps) {
  return (
    <button
      type="button"
      data-tbdp-ui
      data-tbdp-component="split-button"
      dir={dir}
      disabled={disabled || loading}
      aria-busy={loading}
      className={tbdpClass("btn", { [size]: true, primary: true }, className)}
      {...splitButtonA11yProps({ label, disabled })}
      {...rest}
    >
      {loading ? <span aria-hidden="true">…</span> : null}
      {children ?? label}
    </button>
  );
}
