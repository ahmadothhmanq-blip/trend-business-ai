"use client";

import { useEffect, useState } from "react";

type EducationPremiumFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EducationPremiumFloatingCta({
  title = "Applications open for Class of 2030",
  subtitle = "Schedule a campus visit or speak with admissions.",
  ctaLabel = "Apply now",
  ctaHref = "#contact",
}: EducationPremiumFloatingCtaProps) {
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
      data-v2-component="education-premium-floating-cta"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 motion-safe:animate-[ed-slide-up_0.4s_ease_both]"
      role="complementary"
      aria-label="Quick action"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[82rem] items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--color-surface)]/95 px-5 py-3 shadow-[var(--shadow-surface)] backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="ed-font-display truncate text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
            {title}
          </p>
          <p className="ed-font-body hidden truncate text-xs text-[var(--color-muted)] sm:block">
            {subtitle}
          </p>
        </div>
        <a href={ctaHref} className="ed-btn-primary shrink-0 text-xs sm:text-sm">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
