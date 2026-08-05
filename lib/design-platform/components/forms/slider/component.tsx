"use client";

import type { SliderProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { sliderA11yProps } from "./accessibility";

export type { SliderProps } from "./types";

export function Slider({
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
}: SliderProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="slider" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
