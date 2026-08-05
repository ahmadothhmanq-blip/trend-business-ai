import type { VideoPlayerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { videoPlayerA11yProps } from "./accessibility";

export type { VideoPlayerProps } from "./types";

export function VideoPlayer({
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
}: VideoPlayerProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="video-player" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
