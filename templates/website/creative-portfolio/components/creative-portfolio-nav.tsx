"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#filmstrip", label: "Work" },
  { href: "#about", label: "Colophon" },
  { href: "#contact", label: "Contact" },
];

type CreativePortfolioNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CreativePortfolioNav({
  brandName = "Kinetic",
  ctaLabel = "Start a project",
  links = DEFAULT_LINKS,
}: CreativePortfolioNavProps) {
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
    <header data-v2-component="creative-portfolio-nav" className="cp-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="cp-nav-inner">
        <a href="#top" className="cp-nav-brand">
          {brandName}
        </a>
        <nav aria-label="Primary" className="cp-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="cp-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center border border-current/40 lg:hidden cp-focus-ring"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="flex flex-col gap-1">
            <span className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open ? (
        <nav
          id="cp-mobile-nav"
          aria-label="Mobile"
          className="border-t border-current/20 bg-[var(--color-background)] px-5 py-4 text-[var(--color-foreground)] mix-blend-normal lg:hidden"
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="cp-font-mono block py-1 text-xs uppercase tracking-[0.18em]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="cp-btn-volt inline-flex">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
