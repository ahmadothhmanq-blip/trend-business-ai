import type { SkeletonProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { skeletonA11yProps } from "./accessibility";

export type { SkeletonProps } from "./types";

export function Skeleton({
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
}: SkeletonProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="skeleton" className={tbdpClass("skeleton", {}, className)} style={{ height: "1rem", width: "100%" }} aria-hidden="true" {...rest} />
  );
}
