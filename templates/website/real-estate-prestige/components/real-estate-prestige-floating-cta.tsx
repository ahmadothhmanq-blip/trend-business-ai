"use client";

import { useEffect, useState } from "react";

type RealEstatePrestigeFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function RealEstatePrestigeFloatingCta({
  ctaLabel = "Get started",
  ctaHref = "#contact",
}: RealEstatePrestigeFloatingCtaProps) {
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
      data-v2-component="real-estate-prestige-floating-cta"
      className="fixed bottom-8 start-1/2 z-40 -translate-x-1/2"
      role="complementary"
      aria-label={ctaLabel}
    >
      <a href={ctaHref} className="rep-floating-cta rep-focus-ring inline-flex rounded-[var(--radius-md)] px-8 py-3 rep-title">
        {ctaLabel}
      </a>
    </div>
  );
}
