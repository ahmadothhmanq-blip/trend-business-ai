"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "/platform", label: "Platform" },
  { href: "/customers", label: "Customers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

type SaasEnterpriseNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SaasEnterpriseNav({
  brandName = "Northline",
  ctaLabel = "Book a demo",
  links = DEFAULT_LINKS,
}: SaasEnterpriseNavProps) {
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
    <header
      data-v2-component="saas-enterprise-nav"
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-[var(--border-default)] bg-[var(--color-surface)]/90 shadow-[var(--shadow-card)] backdrop-blur-xl"
          : "border-transparent bg-[var(--color-background)]/80 backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[4.25rem]">
        <a
          href="#top"
          className="se-font-display flex items-center gap-2.5 text-base font-bold tracking-tight text-[var(--color-foreground)] se-focus-ring rounded-sm"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-xs font-bold text-white"
            aria-hidden
          >
            N
          </span>
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="se-font-body text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)] se-focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" className="se-btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="se-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden se-focus-ring"
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
        <nav
          id="se-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="se-font-body block py-1 text-sm font-medium text-[var(--color-foreground)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="se-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
