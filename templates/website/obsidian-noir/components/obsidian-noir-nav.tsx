"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Theses" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Voices" },
  { href: "#contact", label: "Contact" },
];

type ObsidianNoirNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ObsidianNoirNav({
  brandName = "Obsidian",
  ctaLabel = "Inquire",
  links = DEFAULT_LINKS,
}: ObsidianNoirNavProps) {
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
    <header data-v2-component="obsidian-noir-nav" className="ob-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="ob-nav-inner">
        <a href="#top" className="ob-nav-brand">
          {brandName}
        </a>
        <nav aria-label="Primary" className="ob-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#contact" className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] sm:inline">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="ob-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--border-default)] lg:hidden ob-focus-ring"
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
        <nav id="ob-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] px-5 py-6 lg:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="ob-font-body text-sm uppercase tracking-[0.14em] text-[var(--color-foreground)]">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="ob-btn-primary">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
