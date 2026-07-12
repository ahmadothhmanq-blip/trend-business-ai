"use client";

import { cn } from "@/lib/utils";

export function OfficialLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/35 bg-[radial-gradient(circle_at_30%_20%,rgb(255_215_0/0.24),rgb(212_175_55/0.08)_42%,rgb(5_5_5/0.9)_100%)] shadow-[0_0_28px_rgb(212_175_55/0.14)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" fill="none" className="size-7">
          <path
            d="M22 5 35.5 12.5V27c0 7.2-5.2 11-13.5 13-8.3-2-13.5-5.8-13.5-13V12.5L22 5Z"
            fill="url(#official-logo-fill)"
            stroke="url(#official-logo-stroke)"
            strokeWidth="1.2"
          />
          <path
            d="M14 16h16M22 16v17M16 24h12"
            stroke="url(#official-logo-stroke)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="official-logo-fill" x1="10" y1="7" x2="34" y2="39">
              <stop stopColor="#1A1A1A" />
              <stop offset="1" stopColor="#050505" />
            </linearGradient>
            <linearGradient id="official-logo-stroke" x1="8" y1="5" x2="36" y2="39">
              <stop stopColor="#FFF2A8" />
              <stop offset="0.45" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#9A7414" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-white">
            Trend <span className="text-gradient-gold">Business AI</span>
          </p>
          <p className="mt-1 text-[9px] font-semibold tracking-[0.24em] text-[#D4AF37]/75 uppercase">
            Premium AI Company
          </p>
        </div>
      )}
    </div>
  );
}
