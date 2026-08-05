import type { FaqProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { faqA11yProps } from "./accessibility";

export type { FaqProps } from "./types";

export function Faq({
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
}: FaqProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="faq" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
