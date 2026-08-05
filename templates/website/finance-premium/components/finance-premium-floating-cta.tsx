"use client";

import { useEffect, useState } from "react";

type FinancePremiumFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function FinancePremiumFloatingCta({
  title = "Begin your stewardship conversation",
  subtitle = "Confidential consultation with a senior partner.",
  ctaLabel = "Schedule consultation",
  ctaHref = "#contact",
}: FinancePremiumFloatingCtaProps) {
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
      data-v2-component="finance-premium-floating-cta"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 motion-safe:animate-[fn-slide-up_0.4s_ease_both]"
      role="complementary"
      aria-label="Quick action"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[82rem] items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-accent)] bg-[var(--color-ink)]/95 px-5 py-3 shadow-[var(--shadow-surface)] backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="fn-font-display truncate text-sm font-semibold text-[var(--color-background)] sm:text-base">
            {title}
          </p>
          <p className="fn-font-body hidden truncate text-xs text-[color-mix(in_srgb,var(--color-background)_65%,transparent)] sm:block">
            {subtitle}
          </p>
        </div>
        <a href={ctaHref} className="fn-btn-primary shrink-0 text-xs sm:text-sm">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
