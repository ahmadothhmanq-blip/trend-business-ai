"use client";

import type { OtpInputProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { otpInputA11yProps } from "./accessibility";

export type { OtpInputProps } from "./types";

export function OtpInput({
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
}: OtpInputProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="otp" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
