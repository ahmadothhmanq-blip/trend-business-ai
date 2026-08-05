"use client";

import type { ModalProps } from "./types";
import { tbdpClass, v } from "@/lib/design-platform/components/core";
import { modalA11yProps } from "./accessibility";

export type { ModalProps } from "./types";

export function Modal({
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
}: ModalProps & { open?: boolean; onClose?: () => void; }) {
  if (!open) return null;
  return (
    <div data-tbdp-ui data-tbdp-component="modal" className="tbdp-modal-overlay" role="presentation" onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={label ?? title} className={tbdpClass("modal", {}, className)} onClick={(e) => e.stopPropagation()} {...rest}>
        {title ? <header style={{ padding: v.spacing.lg }}><h2>{title}</h2></header> : null}
        <div style={{ padding: v.spacing.lg }}>{children}</div>
      </div>
    </div>
  );
}
