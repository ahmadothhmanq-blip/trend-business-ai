"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Courses" },
  { href: "#portfolio", label: "Cellar" },
  { href: "#contact", label: "Reserve" },
];

type RestaurantSignatureNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantSignatureNav({
  brandName = "Forest",
  ctaLabel = "Reserve",
  links = DEFAULT_LINKS,
}: RestaurantSignatureNavProps) {
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
    <header data-v2-component="restaurant-signature-nav" className="rs-menu-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="rs-menu-nav-inner">
        <a href="#top" className="rs-menu-nav-brand">
          {brandName}
        </a>
        <nav aria-label="Primary" className="rs-menu-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="rs-btn-ghost hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="rs-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center border border-[color-mix(in_srgb,var(--color-copper)_35%,transparent)] md:hidden rs-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex flex-col gap-1">
              <span className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="rs-mobile-nav" aria-label="Mobile" className="border-t border-[color-mix(in_srgb,var(--color-copper)_25%,transparent)] px-5 py-4 md:hidden">
          <ul className="mx-auto flex max-w-[42rem] flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="block py-1 text-sm tracking-wide">
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
