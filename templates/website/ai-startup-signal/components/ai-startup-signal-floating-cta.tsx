"use client";

import { useEffect, useState } from "react";

type AiStartupSignalFloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function AiStartupSignalFloatingCta({
  title = "Ready to get started?",
  subtitle = "Speak with our team today.",
  ctaLabel = "Contact us",
  ctaHref = "#contact",
}: AiStartupSignalFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <div data-v2-component="ai-startup-signal-floating-cta" className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4" role="complementary">
      <div className="as-glass-card flex items-center gap-4 rounded-2xl border border-[var(--border-accent)] px-5 py-3 backdrop-blur-xl">
        <p className="text-sm font-medium">{title}</p>
        <a href={ctaHref} className="as-btn-primary text-xs">{ctaLabel}</a>
      </div>
    </div>
  );
}
