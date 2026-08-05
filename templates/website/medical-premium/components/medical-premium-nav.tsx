"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#specialties", label: "Specialties" },
  { href: "#physicians", label: "Physicians" },
  { href: "#care", label: "Care journey" },
  { href: "#appointments", label: "Appointments" },
];

type MedicalPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function MedicalPremiumNav({
  brandName = "Aether Medical",
  ctaLabel = "Book appointment",
  links = DEFAULT_LINKS,
}: MedicalPremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = brandName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      data-v2-component="medical-premium-nav"
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-[var(--border-subtle)] bg-[var(--color-pearl)]/97 shadow-[var(--shadow-card)] backdrop-blur-xl"
          : "border-transparent bg-[var(--color-pearl)]/85 backdrop-blur-md",
      ].join(" ")}
    >
      <div
        className="h-0.5 w-full bg-gradient-to-r from-[var(--color-healing)] via-[var(--color-primary)] to-[var(--color-accent)]"
        aria-hidden
      />
      <div className="mx-auto flex h-16 max-w-[76rem] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[4.5rem]">
        <a
          href="#top"
          className="mp-font-display flex items-center gap-3 text-lg text-[var(--color-primary)] mp-focus-ring rounded-sm"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-healing)] bg-[var(--color-surface)] text-xs font-semibold tracking-wider text-[var(--color-primary)]"
            aria-hidden
          >
            {initials}
          </span>
          <span className="hidden sm:inline">{brandName}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mp-font-body text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--color-primary)] mp-focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:911"
            className="mp-font-body hidden text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] sm:inline-flex mp-focus-ring"
            aria-label="Emergency: call 911"
          >
            Emergency
          </a>
          <a href="#appointments" className="mp-btn-primary hidden text-sm sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mp-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)]/50 lg:hidden mp-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="text-lg text-[var(--color-primary)]">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mp-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-subtle)] bg-[var(--color-pearl)] px-5 py-5 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mp-font-body block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-3 border-t border-[var(--border-subtle)] pt-4">
              <a href="#appointments" onClick={() => setOpen(false)} className="mp-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
