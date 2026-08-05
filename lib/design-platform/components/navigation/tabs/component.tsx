"use client";

import type { TabsProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { tabsA11yProps } from "./accessibility";

export type { TabsProps } from "./types";

export function Tabs({
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
}: TabsProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="tabs" role="tablist" aria-label={label ?? "Tabs"} dir={dir} className={tbdpClass("tabs", {}, className)} {...rest}>
      {children}
    </div>
  );
}
