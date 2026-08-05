"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#chef", label: "Chef" },
  { href: "#gallery", label: "Gallery" },
  { href: "#reserve", label: "Reserve" },
];

type RestaurantSignatureNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantSignatureNav({
  brandName = "Maison Verdant",
  ctaLabel = "Reserve",
  links = DEFAULT_LINKS,
}: RestaurantSignatureNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-v2-component="restaurant-signature-nav"
      className={[
        "fixed inset-x-0 top-0 z-[60] transition-all duration-500",
        scrolled
          ? "border-b border-[var(--border-subtle)] bg-[var(--color-background)]/92 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <a
          href="#top"
          className="rs-font-display text-lg tracking-[0.06em] text-[var(--color-foreground)] transition hover:text-[var(--color-copper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-copper)]"
        >
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rs-font-body text-[0.625rem] font-medium uppercase tracking-[0.32em] text-[var(--color-muted)] transition hover:text-[var(--color-copper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-copper)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#reserve" className="rs-btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="rs-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-subtle)] text-[var(--color-foreground)] lg:hidden rs-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex flex-col gap-1.5">
              <span className={`block h-px w-5 bg-current transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-px w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-px w-5 bg-current transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="rs-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-subtle)] bg-[var(--color-background)]/98 px-5 py-6 lg:hidden"
        >
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rs-font-body block text-sm uppercase tracking-[0.28em] text-[var(--color-foreground)]/80"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#reserve" onClick={() => setOpen(false)} className="rs-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
