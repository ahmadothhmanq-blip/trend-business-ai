"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#portfolio", label: "Work" },
  { href: "#features", label: "Services" },
  { href: "#about", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

type CreativeAgencyPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CreativeAgencyPremiumNav({
  brandName = "Volt",
  ctaLabel = "Inquire",
  links = LINKS,
}: CreativeAgencyPremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  return (
    <header
      data-v2-component="creative-agency-premium-nav"
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[var(--border-default)] bg-[var(--color-background)]/90 backdrop-blur-xl" : "bg-transparent"}`}
    >
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="mx-auto flex h-[4.25rem] max-w-[88rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="sv-font-display text-base font-semibold tracking-tight text-[var(--color-ghost)] sv-focus-ring [text-transform:none]">
          {brandName}
        </a>
        <nav aria-label="Primary" className="hidden gap-9 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[0.8125rem] text-[var(--color-muted)] transition hover:text-[var(--color-ghost)]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#contact" className="sv-btn-volt !min-h-9 !px-4 !py-2 !text-[0.625rem] hidden sm:inline-flex">{ctaLabel}</a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="sv-nav-mobile"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-[var(--border-default)] md:hidden sv-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span className="text-xs">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="sv-nav-mobile" className="border-t border-[var(--border-default)] px-5 py-4 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-[var(--color-ghost)]">{l.label}</a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="sv-btn-volt mt-3 w-full">Inquire</a>
        </nav>
      ) : null}
    </header>
  );
}
