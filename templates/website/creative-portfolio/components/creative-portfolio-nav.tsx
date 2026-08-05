"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#studio", label: "Studio" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

type CreativePortfolioNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CreativePortfolioNav({
  brandName = "Kinetic Atelier",
  ctaLabel = "Start a project",
  links = DEFAULT_LINKS,
}: CreativePortfolioNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-v2-component="creative-portfolio-nav"
      className={[
        "sticky top-0 z-50 border-b transition-all duration-500",
        scrolled
          ? "border-[var(--border-default)] bg-[var(--color-background)]/92 backdrop-blur-md"
          : "border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:h-[4.5rem]">
        <a
          href="#top"
          className="cp-font-display cp-focus-ring group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-ghost)]"
        >
          <span
            className="inline-block h-2 w-2 bg-[var(--color-volt)] transition-transform group-hover:scale-125"
            aria-hidden
          />
          {brandName}
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="cp-font-mono cp-focus-ring text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] transition hover:text-[var(--color-volt)]"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <span className="text-[var(--color-zinc)]" aria-hidden>
                0{i + 1}
              </span>{" "}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="cp-btn-volt hidden sm:inline-flex"
          >
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="cp-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="cp-focus-ring inline-flex h-11 w-11 items-center justify-center border border-[var(--border-default)] lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="cp-font-mono text-lg text-[var(--color-volt)]">
              {open ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="cp-mobile-nav"
          aria-label="Mobile"
          className="border-t border-[var(--border-default)] bg-[var(--color-background)] px-5 py-6 lg:hidden"
        >
          <ul className="flex flex-col gap-4">
            {links.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="cp-font-mono flex items-baseline gap-3 text-sm uppercase tracking-widest"
                >
                  <span className="text-[var(--color-volt)]">0{i + 1}</span>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <a href="#contact" onClick={() => setOpen(false)} className="cp-btn-volt w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
