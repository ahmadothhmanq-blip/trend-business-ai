"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#portfolio", label: "Case studies" },
  { href: "#about", label: "The firm" },
  { href: "#contact", label: "Contact" },
];

export function CorporateBusinessNav({
  brandName = "Atlas",
  ctaLabel = "Schedule consultation",
  links = LINKS,
}: {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
}) {
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
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      data-v2-component="corporate-business-nav"
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "border-[var(--border-default)] bg-[var(--color-surface)]/98 shadow-sm backdrop-blur-md" : "border-transparent bg-[var(--color-background)]"
      }`}
    >
      <a href="#main-content" className="df-skip-link">Skip to main content</a>
      <div className="mx-auto flex h-[4.25rem] max-w-[88rem] items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="cb-font-display flex items-center gap-3 font-semibold cb-focus-ring">
          <span className="flex h-9 w-9 items-center justify-center border border-[var(--border-accent)] bg-[var(--color-primary)] text-sm text-[var(--color-accent)]" aria-hidden>A</span>
          <span>{brandName}</span>
        </a>
        <nav aria-label="Primary" className="hidden flex-1 justify-center gap-10 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="cb-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
          <button type="button" aria-expanded={open} aria-controls="cb-mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden cb-focus-ring">
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
        <nav id="cb-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] px-5 py-4 lg:hidden">
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium">{l.label}</a>)}
          <a href="#contact" onClick={() => setOpen(false)} className="cb-btn-primary mt-3 w-full">{ctaLabel}</a>
        </nav>
      ) : null}
    </header>
  );
}
