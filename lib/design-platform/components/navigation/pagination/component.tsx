import type { PaginationProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { paginationA11yProps } from "./accessibility";

export type { PaginationProps } from "./types";

export function Pagination({
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
}: PaginationProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="pagination" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
