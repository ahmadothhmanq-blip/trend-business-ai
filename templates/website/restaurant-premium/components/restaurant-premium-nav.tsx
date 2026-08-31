"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#about", label: "About" },
  { href: "#portfolio", label: "Work" },
  { href: "#pricing", label: "Engagement" },
  { href: "#contact", label: "Contact" },
];

type RestaurantPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantPremiumNav({
  brandName = "Ember",
  ctaLabel = "Speak with us",
  links = DEFAULT_LINKS,
}: RestaurantPremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      data-v2-component="restaurant-premium-nav"
      className={`rp-topnav ${scrolled ? "rp-topnav--solid" : ""}`}
    >
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="rp-shell rp-topnav-inner df-animate-nav">
        <a href="#top" className="rp-brand rp-focus-ring">
          {brandName}
        </a>
        <nav aria-label="Primary" className="rp-topnav-links hidden lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="rp-topnav-link rp-focus-ring">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="rp-topnav-actions">
          <a href="#contact" className="rp-btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            className="rp-menu-btn lg:hidden rp-focus-ring"
            aria-expanded={open}
            aria-controls="rp-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="rp-mobile-nav" aria-label="Mobile" className="rp-mobile-panel lg:hidden">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contact" className="rp-btn-primary" onClick={() => setOpen(false)}>
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
