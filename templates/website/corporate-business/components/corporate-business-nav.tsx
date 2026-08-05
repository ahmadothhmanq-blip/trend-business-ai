"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Client stories" },
  { href: "#contact", label: "Contact" },
];

type CorporateBusinessNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CorporateBusinessNav({
  brandName = "Meridian Advisory",
  ctaLabel = "Schedule consultation",
  links = DEFAULT_LINKS,
}: CorporateBusinessNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#top");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
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
      data-v2-component="corporate-business-nav"
      className={[
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--color-background)_94%,transparent)] shadow-[0_1px_0_rgba(8,14,24,0.04),0_8px_32px_rgba(8,14,24,0.04)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="cb-container flex h-[4.5rem] items-center justify-between gap-8 lg:h-[5rem]">
        <a
          href="#top"
          className="cb-font-display group flex items-center gap-3.5 text-[1.125rem] font-medium tracking-tight text-[var(--color-foreground)] cb-focus-ring"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-accent)] bg-[var(--color-ink)] text-sm font-medium text-[var(--color-signal)] transition group-hover:border-[var(--color-signal)]"
            aria-hidden
          >
            M
          </span>
          <span className="hidden sm:inline">{brandName}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-11 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-active={activeHash === link.href ? "true" : undefined}
              className="cb-nav-link cb-focus-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#contact" className="cb-btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="cb-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden cb-focus-ring"
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
          id="cb-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-subtle)] bg-[var(--color-surface)] px-6 py-8 lg:hidden"
        >
          <ul className="flex flex-col gap-5">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="cb-font-display block py-1 text-2xl font-medium text-[var(--color-foreground)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="border-t border-[var(--border-subtle)] pt-6">
              <a href="#contact" onClick={() => setOpen(false)} className="cb-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
