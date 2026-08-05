"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#collection", label: "Collection" },
  { href: "#neighborhoods", label: "Neighborhoods" },
  { href: "#architecture", label: "Architecture" },
  { href: "#advisors", label: "Advisors" },
  { href: "#inquire", label: "Inquire" },
];

type RealEstatePremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RealEstatePremiumNav({
  brandName = "Prestige Estates",
  ctaLabel = "Private showing",
  links = DEFAULT_LINKS,
}: RealEstatePremiumNavProps) {
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
      data-v2-component="real-estate-premium-nav"
      className={[
        "fixed inset-x-0 top-0 z-[60] transition-all duration-500",
        scrolled
          ? "border-b border-[var(--border-subtle)] bg-[var(--color-background)]/96 backdrop-blur-xl shadow-[0_1px_0_rgba(166,124,82,0.08)]"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[5rem] max-w-[90rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <a
          href="#top"
          className="rep-font-display text-xl tracking-[0.06em] text-[var(--color-foreground)] transition hover:text-[var(--color-brass)] rep-focus-ring"
        >
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 xl:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rep-font-body group relative text-[0.6875rem] font-medium uppercase tracking-[0.3em] text-[var(--color-muted)] transition hover:text-[var(--color-foreground)] rep-focus-ring"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--color-brass)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#inquire" className="rep-btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="rep-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center border border-[var(--border-default)] lg:hidden rep-focus-ring"
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
          id="rep-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-subtle)] bg-[var(--color-background)]/98 px-5 py-8 lg:hidden"
        >
          <ul className="flex flex-col gap-5">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rep-font-body block text-sm uppercase tracking-[0.26em] text-[var(--color-foreground)]/80"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a href="#inquire" onClick={() => setOpen(false)} className="rep-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
