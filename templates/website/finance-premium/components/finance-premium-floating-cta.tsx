"use client";

import { useEffect, useState } from "react";

export function FinancePremiumFloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 480);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (!show) return null;

  return (
    <a
      href="#contact"
      data-v2-component="finance-premium-floating-cta"
      className="fn-btn-primary fn-focus-ring fixed bottom-6 end-6 z-40 shadow-lg"
      role="complementary"
    >
      Speak with an advisor
    </a>
  );
}
