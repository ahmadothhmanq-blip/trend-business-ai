import type { RadioProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { radioA11yProps } from "./accessibility";

export type { RadioProps } from "./types";

export function Radio({
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
}: RadioProps) {
  return (
    <input
      data-tbdp-ui
      data-tbdp-component="radio"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("input", { [size]: true }, className)}
      type="radio"
      aria-label={label}
      placeholder={description}
      {...rest}
    />
  );
}
