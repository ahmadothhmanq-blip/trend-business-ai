import type { SearchInputProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { searchInputA11yProps } from "./accessibility";

export type { SearchInputProps } from "./types";

export function SearchInput({
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
}: SearchInputProps) {
  return (
    <input
      data-tbdp-ui
      data-tbdp-component="search"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("input", { [size]: true }, className)}
      type="search"
      aria-label={label}
      placeholder={description}
      {...rest}
    />
  );
}
