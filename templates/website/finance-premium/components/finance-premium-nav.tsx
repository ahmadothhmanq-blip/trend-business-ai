"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#features", label: "Services" },
  { href: "#portfolio", label: "Mandates" },
  { href: "#about", label: "The firm" },
  { href: "#contact", label: "Advisors" },
];

type FinancePremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function FinancePremiumNav({
  brandName = "Ledger",
  ctaLabel = "Speak with an advisor",
  links = LINKS,
}: FinancePremiumNavProps) {
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
      data-v2-component="finance-premium-nav"
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-[var(--border-default)] bg-[var(--color-background)]/95 shadow-[0_8px_32px_-16px_rgba(11,31,51,0.12)] backdrop-blur-md"
          : "border-transparent bg-[var(--color-background)]"
      }`}
    >
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="mx-auto flex h-[4.5rem] max-w-[82rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="fn-font-display group flex items-center gap-3 text-base font-semibold tracking-tight fn-focus-ring">
          <span className="flex h-9 w-9 items-center justify-center border border-[var(--border-accent)] bg-[var(--color-primary)] text-sm font-medium text-[var(--color-accent)] transition group-hover:border-[var(--color-accent)]">
            L
          </span>
          <span>{brandName}</span>
        </a>
        <nav aria-label="Primary" className="hidden gap-10 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="group relative text-sm text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]">
              <span>{l.label}</span>
              <span className="absolute -bottom-1 start-0 h-px w-0 bg-[var(--color-accent)] transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="fn-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="fn-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden fn-focus-ring"
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
        <nav id="fn-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="fn-font-body block py-1 text-sm font-medium text-[var(--color-foreground)]">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="fn-btn-primary w-full">{ctaLabel}</a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
