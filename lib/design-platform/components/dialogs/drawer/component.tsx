"use client";

import type { DrawerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { drawerA11yProps } from "./accessibility";

export type { DrawerProps } from "./types";

export function Drawer({
  size = "md",
  dir,
  className,
  children,
  title,
  description,
  label,
  disabled,
  loading,
  open, onClose,
  ...rest
}: DrawerProps & { open?: boolean; onClose?: () => void; }) {
  if (!open) return null;
  return (
    <div data-tbdp-ui data-tbdp-component="drawer" className="tbdp-modal-overlay" role="presentation" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={label ?? title} className={tbdpClass("drawer", {}, className)} onClick={(e) => e.stopPropagation()} {...rest}>
        {children}
      </aside>
    </div>
  );
}
