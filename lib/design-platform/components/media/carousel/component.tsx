"use client";

import type { CarouselProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { carouselA11yProps } from "./accessibility";

export type { CarouselProps } from "./types";

export function Carousel({
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
}: CarouselProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="carousel" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
