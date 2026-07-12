"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/images/brand/trend-business-logo.png";
const ICON_SRC = "/images/brand/trend-business-icon.png";

type OfficialLogoProps = {
  className?: string;
  /** Shield/icon only (no wordmark). */
  compact?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: { full: "h-9 w-auto", icon: "size-8" },
  md: { full: "h-11 w-auto", icon: "size-9" },
  lg: { full: "h-14 w-auto", icon: "size-11" },
} as const;

export function OfficialLogo({
  className,
  compact = false,
  size = "md",
}: OfficialLogoProps) {
  const s = SIZE[size];

  if (compact) {
    return (
      <span className={cn("relative inline-flex shrink-0", s.icon, className)}>
        <Image
          src={ICON_SRC}
          alt="Trend Business AI"
          fill
          sizes="44px"
          className="object-contain"
          priority
          unoptimized
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex shrink-0 items-center", className)}>
      <Image
        src={LOGO_SRC}
        alt="Trend Business AI"
        width={244}
        height={259}
        className={cn("object-contain", s.full)}
        priority
        unoptimized
      />
    </span>
  );
}
