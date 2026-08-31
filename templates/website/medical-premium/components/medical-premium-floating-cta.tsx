"use client";

import { useEffect, useState } from "react";

type MedicalPremiumFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function MedicalPremiumFloatingCta({
  title = "Ready to get started?",
  subtitle = "Speak with our team today.",
  ctaLabel = "Contact us",
  ctaHref = "#contact",
}: MedicalPremiumFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <div data-v2-component="medical-premium-floating-cta" className="fixed bottom-6 end-6 z-40" role="complementary">
      <a href={ctaHref} className="mp-btn-primary !rounded-full inline-flex rounded-full px-6 py-3 text-sm font-bold shadow-lg">{ctaLabel}</a>
    </div>
  );
}
