"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#stats", label: "Markets" },
  { href: "#features", label: "Rails" },
  { href: "#pricing", label: "Plans" },
  { href: "#faq", label: "Compliance" },
  { href: "#contact", label: "Access" },
];

type PulseFintechNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function PulseFintechNav({
  brandName = "Pulse",
  ctaLabel = "Get API access",
  links = DEFAULT_LINKS,
}: PulseFintechNavProps) {
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
    <header data-v2-component="pulse-fintech-nav" className="pu-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="pu-nav-inner">
        <a href="#top" className="pu-nav-brand">
          {brandName.toUpperCase()}{" // LIVE"}
        </a>
        <nav aria-label="Primary" className="pu-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="pu-btn-primary pu-focus-ring hidden sm:inline-flex !min-h-8 !px-3 !py-1.5">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="pu-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-[var(--border-default)] lg:hidden pu-focus-ring"
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
        <nav id="pu-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] px-4 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="pu-font-mono block text-sm text-[var(--color-foreground)]">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="pu-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
