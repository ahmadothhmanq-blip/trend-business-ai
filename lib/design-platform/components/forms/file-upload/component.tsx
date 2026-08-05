"use client";

import type { FileUploadProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { fileUploadA11yProps } from "./accessibility";

export type { FileUploadProps } from "./types";

export function FileUpload({
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
}: FileUploadProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="file-upload" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
