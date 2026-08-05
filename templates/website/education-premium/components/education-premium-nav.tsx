"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Academics" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Student stories" },
  { href: "#contact", label: "Admissions" },
];

type EducationPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EducationPremiumNav({
  brandName = "Scholar's Hall",
  ctaLabel = "Apply now",
  links = DEFAULT_LINKS,
}: EducationPremiumNavProps) {
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
      data-v2-component="education-premium-nav"
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-[var(--border-default)] bg-[var(--color-surface)]/92 shadow-[var(--shadow-card)] backdrop-blur-xl"
          : "border-transparent bg-[var(--color-background)]/85 backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[4.25rem]">
        <a
          href="#top"
          className="ed-font-display flex items-center gap-2.5 text-base font-semibold tracking-tight text-[var(--color-foreground)] ed-focus-ring rounded-sm"
        >
          <span className="ed-crest" aria-hidden>
            S
          </span>
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="ed-font-body text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)] ed-focus-ring rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" className="ed-btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="ed-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden ed-focus-ring"
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
          id="ed-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="ed-font-body block py-1 text-sm font-medium text-[var(--color-foreground)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="ed-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
