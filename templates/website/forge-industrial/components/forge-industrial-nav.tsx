"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Modules" },
  { href: "#platform", label: "BOM" },
  { href: "#portfolio", label: "Figures" },
  { href: "#pricing", label: "Packages" },
  { href: "#contact", label: "RFQ" },
];

type ForgeIndustrialNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
  sheetId?: string;
  revision?: string;
};

export function ForgeIndustrialNav({
  brandName = "Forge",
  ctaLabel = "Request assessment",
  links = DEFAULT_LINKS,
  sheetId = "DWG-01",
  revision = "REV C",
}: ForgeIndustrialNavProps) {
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
    <header data-v2-component="forge-industrial-nav" className="fg-util-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="fg-util-nav-inner">
        <div className="fg-util-nav-sheet" aria-hidden>
          <span>{sheetId}</span>
          <span>·</span>
          <span>{revision}</span>
        </div>
        <a href="#top" className="fg-util-nav-brand fg-focus-ring">
          {brandName}
        </a>
        <nav aria-label="Primary" className="fg-util-nav-links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="fg-focus-ring">
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="fg-util-nav-cta fg-focus-ring">
          {ctaLabel}
        </a>
        <div className="flex items-center px-3 lg:hidden">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="fg-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--border-default)] bg-[var(--color-surface)] fg-focus-ring"
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
        <nav id="fg-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="fg-font-mono block py-1 text-sm uppercase tracking-wider">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="fg-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
