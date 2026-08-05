"use client";

import type { MultiSelectProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { multiSelectA11yProps } from "./accessibility";

export type { MultiSelectProps } from "./types";

export function MultiSelect({
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
}: MultiSelectProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="multi-select" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
