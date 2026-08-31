"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Lookbook" },
  { href: "#portfolio", label: "Products" },
  { href: "#about", label: "Atelier" },
  { href: "#pricing", label: "Collections" },
  { href: "#contact", label: "Contact" },
];

type EcommercePremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EcommercePremiumNav({
  brandName = "Atelier",
  ctaLabel = "Shop",
  links = DEFAULT_LINKS,
}: EcommercePremiumNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header data-v2-component="ecommerce-premium-nav" className="ec-wordmark-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="ec-wordmark-bar">
        <a href="#top" className="ec-wordmark ec-font-display">
          {brandName}
        </a>
        <nav aria-label="Primary" className="ec-wordmark-links hidden md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#pricing" className="ec-wordmark-cta">
          {ctaLabel}
        </a>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="ec-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="ec-wordmark-menu md:hidden ec-focus-ring"
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav id="ec-mobile-nav" aria-label="Mobile" className="ec-wordmark-mobile md:hidden">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
