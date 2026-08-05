import type { ImageProps } from "./types";
import { v } from "@/lib/design-platform/components/core";
import { imageA11yProps } from "./accessibility";

export type { ImageProps } from "./types";

export function Image({
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
}: ImageProps) {
  return (
    <img data-tbdp-ui data-tbdp-component="image" alt={label ?? ""} className={className} style={{ maxWidth: "100%", borderRadius: v.radius.md }} {...rest} />
  );
}
