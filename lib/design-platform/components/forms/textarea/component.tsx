import type { TextareaProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { textareaA11yProps } from "./accessibility";

export type { TextareaProps } from "./types";

export function Textarea({
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
}: TextareaProps) {
  return (
    <textarea
      data-tbdp-ui
      data-tbdp-component="textarea"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("textarea", { [size]: true }, className)}
      
      aria-label={label}
      placeholder={description}
      {...rest}
    />
  );
}
