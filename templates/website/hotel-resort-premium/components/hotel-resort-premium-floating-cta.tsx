"use client";

import { useEffect, useState } from "react";

type HotelResortPremiumFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HotelResortPremiumFloatingCta({
  ctaLabel = "Contact us",
  ctaHref = "#contact",
}: HotelResortPremiumFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div data-v2-component="hotel-resort-premium-floating-cta" className="hr-floating-cta fixed bottom-6 end-6 z-40" role="complementary">
      <a href={ctaHref} className="hr-btn-primary hr-focus-ring inline-flex rounded-full px-6 py-3 shadow-lg">
        {ctaLabel}
      </a>
    </div>
  );
}
