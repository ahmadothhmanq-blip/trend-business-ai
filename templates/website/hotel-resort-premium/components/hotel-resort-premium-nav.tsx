"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#portfolio", label: "Work" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

type HotelResortPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function HotelResortPremiumNav({
  brandName = "Haven",
  ctaLabel = "Get started",
  links = DEFAULT_LINKS,
}: HotelResortPremiumNavProps) {
  const navLinks = Array.isArray(links) && links.length ? links : DEFAULT_LINKS;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header data-v2-component="hotel-resort-premium-nav" className="hr-nav-shell fixed inset-x-0 top-0 z-[60]">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="hr-container">
        <div className={`df-animate-nav hr-nav-bar ${scrolled ? "hr-nav-bar--scrolled" : ""} motion-safe:animate-[hr-reveal-hero_0.7s_cubic-bezier(0.22,1,0.36,1)_both]`}>
          <a href="#top" className="hr-brand hr-link hr-focus-ring">
            {brandName}
          </a>

          <nav aria-label="Primary" className="hr-nav-desktop">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hr-nav-link hr-focus-ring">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#contact" className="hr-btn-primary hidden sm:inline-flex !min-h-[2.5rem] !px-5 !py-2">
              {ctaLabel}
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="hr-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] lg:hidden hr-focus-ring"
            >
              <span className="sr-only">Menu</span>
              <span aria-hidden className="flex flex-col gap-1.5">
                <span className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <nav
          id="hr-mobile-nav"
          aria-label="Mobile"
          className="hr-container mt-2 animate-[hr-reveal-section_0.35s_cubic-bezier(0.22,1,0.36,1)_both] rounded-2xl border border-[var(--border-subtle)] bg-[var(--color-surface-elevated)] p-5 shadow-lg lg:hidden"
        >
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="hr-nav-link block py-1"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="hr-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
