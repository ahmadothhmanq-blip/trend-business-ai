"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Charter" },
  { href: "#about", label: "The firm" },
  { href: "#testimonials", label: "Attestations" },
  { href: "#portfolio", label: "Matters" },
  { href: "#pricing", label: "Engagement" },
  { href: "#contact", label: "Contact" },
];

type CitadelTrustNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
  crestMark?: string;
};

export function CitadelTrustNav({
  brandName = "Citadel",
  ctaLabel = "Request counsel",
  links = DEFAULT_LINKS,
  crestMark = "CT",
}: CitadelTrustNavProps) {
  const navLinks = Array.isArray(links) && links.length ? links : DEFAULT_LINKS;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header data-v2-component="citadel-trust-nav" className="ct-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="ct-nav-inner">
        <a href="#top" className="ct-nav-brand ct-focus-ring">
          <span className="ct-nav-crest" aria-hidden>
            {crestMark}
          </span>
          <span className="ct-nav-name">{brandName}</span>
        </a>
        <nav aria-label="Primary" className="ct-nav-links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="ct-focus-ring">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#contact" className="ct-btn-primary hidden sm:inline-flex ct-focus-ring">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="ct-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--border-default)] lg:hidden ct-focus-ring"
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
        <nav id="ct-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="ct-font-body block py-1 text-sm">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="ct-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
