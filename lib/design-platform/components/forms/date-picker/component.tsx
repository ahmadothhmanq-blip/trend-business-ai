"use client";

import type { DatePickerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { datePickerA11yProps } from "./accessibility";

export type { DatePickerProps } from "./types";

export function DatePicker({
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
}: DatePickerProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="date-picker" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
