import type { SectionProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { sectionA11yProps } from "./accessibility";

export type { SectionProps } from "./types";

export function Section({
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
}: SectionProps) {return <section data-tbdp-ui data-tbdp-component="section" className={tbdpClass("section", {}, className)} dir={dir} {...rest}>{children}</section>;
}
