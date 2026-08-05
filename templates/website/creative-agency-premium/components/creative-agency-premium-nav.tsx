"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#studio", label: "Studio" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

type CreativeAgencyPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CreativeAgencyPremiumNav({
  brandName = "Studio Volt",
  ctaLabel = "Start a project",
  links = DEFAULT_LINKS,
}: CreativeAgencyPremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-v2-component="creative-agency-premium-nav"
      className={[
        "sticky top-0 z-50 border-b transition-all duration-500",
        scrolled
          ? "border-[var(--border-default)] bg-[var(--color-background)]/95 backdrop-blur-lg"
          : "border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="#top"
          className="sv-font-display sv-focus-ring group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-[var(--color-ghost)]"
        >
          <span
            className="inline-block h-2.5 w-2.5 bg-[var(--color-volt)] shadow-[var(--shadow-volt)] transition-transform group-hover:scale-150"
            aria-hidden
          />
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-12 lg:flex">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="sv-font-mono sv-focus-ring group flex items-baseline gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] transition hover:text-[var(--color-volt)]"
            >
              <span className="sv-index-num text-[var(--color-volt)] opacity-60 transition group-hover:opacity-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#contact" className="sv-btn-volt hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="sv-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="sv-focus-ring inline-flex h-11 w-11 items-center justify-center border border-[var(--border-default)] lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="sv-font-mono text-lg text-[var(--color-volt)]">
              {open ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="sv-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-default)] bg-[var(--color-background)] px-5 py-8 lg:hidden"
        >
          <ul className="flex flex-col gap-5">
            {links.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="sv-font-mono flex items-baseline gap-4 text-sm uppercase tracking-widest"
                >
                  <span className="sv-index-num text-[var(--color-volt)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <a href="#contact" onClick={() => setOpen(false)} className="sv-btn-volt w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
