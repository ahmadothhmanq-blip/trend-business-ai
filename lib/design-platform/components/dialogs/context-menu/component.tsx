"use client";

import type { ContextMenuProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { contextMenuA11yProps } from "./accessibility";

export type { ContextMenuProps } from "./types";

export function ContextMenu({
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
}: ContextMenuProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="context-menu" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
