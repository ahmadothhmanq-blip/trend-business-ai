"use client";

import { useEffect, useState } from "react";

export function CorporateBusinessFloatingCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <a href="#contact" data-v2-component="corporate-business-floating-cta" className="cb-btn-primary cb-focus-ring fixed bottom-6 end-6 z-40 shadow-lg" role="complementary">
      Schedule consultation
    </a>
  );
}
