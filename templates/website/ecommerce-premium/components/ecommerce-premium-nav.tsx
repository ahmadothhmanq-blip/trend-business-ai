"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#shop", label: "Shop" },
  { href: "#collections", label: "Collections" },
  { href: "#story", label: "About" },
  { href: "#contact", label: "Contact" },
];

type EcommercePremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EcommercePremiumNav({
  brandName = "Atelier",
  ctaLabel = "Shop now",
  links = DEFAULT_LINKS,
}: EcommercePremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      data-v2-component="ecommerce-premium-nav"
      className={[
        "sticky top-0 z-50 border-b transition-all duration-500",
        scrolled
          ? "border-[var(--border-default)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-card)] backdrop-blur-xl"
          : "border-transparent bg-[var(--color-background)]/70 backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[82rem] items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="#top"
          className="ec-font-display flex items-center gap-3 text-lg tracking-tight text-[var(--color-foreground)] ec-focus-ring rounded-sm"
        >
          <span
            className="flex h-8 w-8 items-center justify-center border border-[var(--border-accent)] text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-champagne)]"
            aria-hidden
          >
            A
          </span>
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="ec-font-body text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[var(--color-muted)] transition hover:text-[var(--color-champagne)] ec-focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#shop" className="ec-btn-primary hidden text-[0.625rem] sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="ec-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden ec-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex flex-col gap-1">
              <span className={`block h-px w-5 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`block h-px w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-px w-5 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="ec-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-5 lg:hidden"
        >
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="ec-font-body block py-1 text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-foreground)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a href="#shop" onClick={() => setOpen(false)} className="ec-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
