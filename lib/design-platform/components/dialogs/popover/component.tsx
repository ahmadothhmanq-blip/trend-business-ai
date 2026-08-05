"use client";

import type { PopoverProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { popoverA11yProps } from "./accessibility";

export type { PopoverProps } from "./types";

export function Popover({
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
}: PopoverProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="popover" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
