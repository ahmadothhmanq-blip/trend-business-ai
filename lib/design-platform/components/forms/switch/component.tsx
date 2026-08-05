"use client";

import type { SwitchProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { switchA11yProps } from "./accessibility";

export type { SwitchProps } from "./types";

export function Switch({
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
}: SwitchProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="switch" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
