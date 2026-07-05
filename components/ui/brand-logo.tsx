import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "landing" | "nav";
}

const sizes = {
  sm: { icon: "size-8", text: "text-[11px]", sub: "text-[9px]" },
  md: { icon: "size-9", text: "text-xs", sub: "text-[10px]" },
  lg: { icon: "size-12", text: "text-sm", sub: "text-[11px]" },
};

export function BrandLogo({
  className,
  iconClassName,
  showWordmark = false,
  size = "md",
  variant = "default",
}: BrandLogoProps) {
  const s = sizes[size];
  const isLanding = variant === "landing" || showWordmark;
  const isNav = variant === "nav";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          s.icon,
          iconClassName,
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 56" fill="none" className="size-full">
          <defs>
            <linearGradient id="logo-gold" x1="0" y1="0" x2="48" y2="56">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8941F" />
            </linearGradient>
            <linearGradient id="logo-shield" x1="24" y1="8" x2="24" y2="52">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
          </defs>
          <path
            d="M24 2 L42 10 V28 C42 40 34 50 24 54 C14 50 6 40 6 28 V10 Z"
            fill="url(#logo-shield)"
            stroke="url(#logo-gold)"
            strokeWidth="1.5"
          />
          <path
            d="M16 18 L20 14 L24 18 L28 14 L32 18"
            stroke="url(#logo-gold)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="14" y="22" width="4" height="12" rx="1" fill="url(#logo-gold)" opacity="0.9" />
          <rect x="20" y="18" width="4" height="16" rx="1" fill="url(#logo-gold)" />
          <rect x="26" y="24" width="4" height="10" rx="1" fill="url(#logo-gold)" opacity="0.85" />
          <rect x="32" y="20" width="4" height="14" rx="1" fill="url(#logo-gold)" opacity="0.95" />
          <path
            d="M18 8 C20 4 28 4 30 8"
            stroke="url(#logo-gold)"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="24" cy="6" r="2" fill="url(#logo-gold)" />
        </svg>
      </div>
      {isNav && (
        <span className="hidden text-[13px] font-semibold leading-none tracking-[-0.01em] sm:inline sm:text-[14px]">
          <span className="text-gradient-gold">Trend </span>
          <span className="text-white/95">Business </span>
          <span className="text-gradient-gold">AI</span>
        </span>
      )}
      {isLanding && !isNav && (
        <div className={cn("leading-none", s.text)}>
          <span className="block font-bold tracking-[0.06em] text-white uppercase">
            Trend
          </span>
          <span className="mt-0.5 block text-[0.85em] font-semibold tracking-[0.18em] text-white/75 uppercase">
            Business
          </span>
        </div>
      )}
    </div>
  );
}

export function BrandLogoWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden="true"
    >
      <path
        d="M24 2 L42 10 V28 C42 40 34 50 24 54 C14 50 6 40 6 28 V10 Z"
        fill="rgb(212 175 55 / 0.04)"
        stroke="rgb(212 175 55 / 0.08)"
        strokeWidth="1"
      />
      <rect x="14" y="22" width="4" height="12" rx="1" fill="rgb(212 175 55 / 0.06)" />
      <rect x="20" y="18" width="4" height="16" rx="1" fill="rgb(212 175 55 / 0.08)" />
      <rect x="26" y="24" width="4" height="10" rx="1" fill="rgb(212 175 55 / 0.06)" />
      <rect x="32" y="20" width="4" height="14" rx="1" fill="rgb(212 175 55 / 0.07)" />
    </svg>
  );
}

export function BrandLogoLarge({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-5", className)}>
      <BrandLogo size="lg" iconClassName="size-[4.5rem] sm:size-20" />
      <div>
        <p className="text-[2rem] font-bold leading-none tracking-[0.02em] text-gradient-gold uppercase sm:text-[2.125rem]">
          Trend
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="h-px w-8 bg-premium-gold/40" aria-hidden="true" />
          <p className="text-xs font-semibold tracking-[0.24em] text-white/60 uppercase sm:text-sm">
            Business
          </p>
          <span className="h-px w-8 bg-premium-gold/40" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
