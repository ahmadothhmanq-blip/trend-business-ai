"use client";

import { useEffect, useState } from "react";

const DEFAULT_NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

type NavLink = { href: string; label: string };

type RealEstatePrestigeNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: NavLink[];
};

export function RealEstatePrestigeNav({
  brandName = "Brand",
  ctaLabel = "Get started",
  links = DEFAULT_NAV_LINKS,
}: RealEstatePrestigeNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      data-v2-component="real-estate-prestige-nav"
      className={`rep-nav ${scrolled ? "rep-nav--scrolled" : ""}`.trim()}
    >
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="rep-brand">
          {brandName}
        </a>
        <nav aria-label="Primary" className="hidden items-center lg:flex lg:gap-10">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="rep-nav-link">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-2">
          <a href="#contact" className="rep-btn-secondary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="rep-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden rep-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex flex-col gap-1">
              <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="rep-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="rep-nav-link block py-1">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="rep-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
