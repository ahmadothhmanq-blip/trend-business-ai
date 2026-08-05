import type { TablesProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { tablesA11yProps } from "./accessibility";

export type { TablesProps } from "./types";

export function Tables({
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
}: TablesProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="tables" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
