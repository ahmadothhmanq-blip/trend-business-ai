"use client";

import { useEffect, useState } from "react";

type EcommercePremiumFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EcommercePremiumFloatingCta({
  title = "New arrivals just dropped",
  subtitle = "Limited editions from our latest maker collaborations.",
  ctaLabel = "Shop now",
  ctaHref = "#shop",
}: EcommercePremiumFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      data-v2-component="ecommerce-premium-floating-cta"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 motion-safe:animate-[ec-slide-up_0.4s_ease_both]"
      role="complementary"
      aria-label="Quick action"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[82rem] items-center justify-between gap-4 border border-[var(--border-accent)] bg-[var(--color-surface)]/97 px-5 py-3.5 shadow-[var(--shadow-surface)] backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="ec-font-display truncate text-sm text-[var(--color-foreground)] sm:text-base">
            {title}
          </p>
          <p className="ec-font-body hidden truncate text-xs text-[var(--color-muted)] sm:block">
            {subtitle}
          </p>
        </div>
        <a href={ctaHref} className="ec-btn-primary shrink-0 text-[0.5625rem] sm:text-[0.625rem]">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
