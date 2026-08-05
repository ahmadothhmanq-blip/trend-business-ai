import type { GalleryProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { galleryA11yProps } from "./accessibility";

export type { GalleryProps } from "./types";

export function Gallery({
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
}: GalleryProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="gallery" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
