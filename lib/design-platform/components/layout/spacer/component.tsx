import type { SpacerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { spacerA11yProps } from "./accessibility";
import { v } from "@/lib/design-platform/components/core";

export type { SpacerProps } from "./types";

export function Spacer({
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
}: SpacerProps) {return <div data-tbdp-ui data-tbdp-component="spacer" aria-hidden="true" style={{ blockSize: v.spacing.lg }} className={className} {...rest} />;
}
