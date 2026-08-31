"use client";

import { useEffect, useState } from "react";

type RestaurantPremiumFloatingCtaProps = {
  ctaLabel?: string;
  ctaHref?: string;
};

export function RestaurantPremiumFloatingCta({
  ctaLabel = "Speak with us",
  ctaHref = "#contact",
}: RestaurantPremiumFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div data-v2-component="restaurant-premium-floating-cta" className="rp-float" role="complementary">
      <a href={ctaHref} className="rp-btn-primary rp-focus-ring">
        {ctaLabel}
      </a>
    </div>
  );
}
