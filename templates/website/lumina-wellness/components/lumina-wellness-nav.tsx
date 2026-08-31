"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Rituals" },
  { href: "#about", label: "Philosophy" },
  { href: "#pricing", label: "Membership" },
  { href: "#contact", label: "Visit" },
];

type LuminaWellnessNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function LuminaWellnessNav({
  brandName = "Lumina",
  ctaLabel = "Book a ritual",
  links = DEFAULT_LINKS,
}: LuminaWellnessNavProps) {
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
    <header data-v2-component="lumina-wellness-nav" className="lu-quiet-nav">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="lu-quiet-nav-inner">
        <a href="#top" className="lu-quiet-nav-brand lu-focus-ring">
          {brandName}
        </a>
        <nav aria-label="Primary" className="lu-quiet-nav-links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="lu-focus-ring">
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="lu-quiet-nav-cta hidden sm:inline lu-focus-ring">
          {ctaLabel}
        </a>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="lu-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] lg:hidden lu-focus-ring"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="flex flex-col gap-1">
            <span className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {open ? (
        <nav id="lu-mobile-nav" aria-label="Mobile" className="border-t border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-5 py-4 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="lu-font-body block py-1 text-sm">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="lu-btn-primary w-full">
                {ctaLabel}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
