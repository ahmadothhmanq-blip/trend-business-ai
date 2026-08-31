"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Platform" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

type AiStartupSignalNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function AiStartupSignalNav({
  brandName = "Signal",
  ctaLabel = "Request access",
  links = DEFAULT_LINKS,
}: AiStartupSignalNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    <header data-v2-component="ai-startup-signal-nav" className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className={["as-nav-glass mx-auto max-w-[82rem]", scrolled ? "as-nav-glass--scrolled" : "", open ? "as-nav-glass--mobile" : ""].filter(Boolean).join(" ")}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <a href="#top" className="as-font-display font-bold as-focus-ring">{brandName}</a>
          <nav aria-label="Primary" className="hidden gap-1 lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="as-nav-link rounded-lg px-3 py-2 text-sm">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#contact" className="as-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="as-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden as-focus-ring"
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
          <nav id="as-mobile-nav" aria-label="Mobile" className="border-t border-[var(--border-default)] px-4 py-4 lg:hidden">
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setOpen(false)} className="as-font-body block py-1 text-sm font-medium text-[var(--color-foreground)]">
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a href="#contact" onClick={() => setOpen(false)} className="as-btn-primary w-full">{ctaLabel}</a>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
