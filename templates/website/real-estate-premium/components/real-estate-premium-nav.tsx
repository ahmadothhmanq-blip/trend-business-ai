"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#portfolio", label: "Listings" },
  { href: "#features", label: "Amenities" },
  { href: "#pricing", label: "Programs" },
  { href: "#contact", label: "Inquire" },
];

type RealEstatePremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RealEstatePremiumNav({
  brandName = "Estates",
  ctaLabel = "Private inquiry",
  links = DEFAULT_LINKS,
}: RealEstatePremiumNavProps) {
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
    <header data-v2-component="real-estate-premium-nav" className="rep-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="rep-nav-inner">
        <a href="#top" className="rep-nav-brand">
          {brandName}
        </a>
        <nav aria-label="Primary" className="rep-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="rep-btn-secondary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="rep-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--border-default)] lg:hidden rep-focus-ring"
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
                <a href={link.href} onClick={() => setOpen(false)} className="block py-1 text-sm">
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
