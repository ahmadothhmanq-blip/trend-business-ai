"use client";

import type { TooltipProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { tooltipA11yProps } from "./accessibility";

export type { TooltipProps } from "./types";

export function Tooltip({
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
}: TooltipProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="tooltip" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
