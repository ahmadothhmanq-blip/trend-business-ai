"use client";

import type { ToastProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { toastA11yProps } from "./accessibility";

export type { ToastProps } from "./types";

export function Toast({
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
}: ToastProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="toast" role="alert" className={tbdpClass("alert", { "info": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );
}
