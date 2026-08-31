"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

type MedicalPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function MedicalPremiumNav({
  brandName = "Brand",
  ctaLabel = "Get started",
  links = DEFAULT_LINKS,
}: MedicalPremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    <header data-v2-component="medical-premium-nav" className="sticky top-0 z-50">
      <div className="mp-container py-4">
        <div
          className={[
            "flex items-center justify-between rounded-full border px-5 py-3 transition-all sm:px-6",
            scrolled
              ? "border-[var(--border-default)] bg-[var(--color-surface)]/95 shadow-sm backdrop-blur-md"
              : "border-[var(--border-subtle)] bg-[var(--color-surface)]/75 backdrop-blur",
          ].join(" ")}
        >
          <a href="#top" className="mp-brand text-base sm:text-lg">
            {brandName}
          </a>
          <nav aria-label="Primary" className="hidden gap-8 lg:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="mp-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#contact" className="mp-btn-primary mp-focus-ring !hidden !min-h-0 !rounded-full !px-4 !py-2 text-xs sm:!inline-flex">
              {ctaLabel}
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mp-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="mp-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden"
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
      </div>

      {open ? (
        <nav
          id="mp-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mp-font-body block py-1 text-sm font-medium text-[var(--color-foreground)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="mp-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
