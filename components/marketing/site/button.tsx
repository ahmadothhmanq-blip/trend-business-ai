"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Reference CTAs — gold primary / dark secondary with gold play accents. */
export function SiteButton({
  href,
  children,
  variant = "gold",
  size = "md",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-11 px-6 text-[14px]",
    lg: "h-12 px-7 text-[15px] sm:h-[50px] sm:px-8",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
        sizes[size],
        variant === "gold"
          ? "bg-[linear-gradient(180deg,#FFD700_0%,#F1C44D_45%,#D4AF37_100%)] text-[#111111] shadow-[0_0_28px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(255,215,0,0.45)] hover:brightness-[1.05]"
          : "border border-[rgba(255,255,255,0.18)] bg-[#111111] text-white hover:border-[rgba(212,175,55,0.4)] hover:bg-[#161616]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
