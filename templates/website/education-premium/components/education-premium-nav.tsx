"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Departments" },
  { href: "#about", label: "Essay" },
  { href: "#portfolio", label: "Campus" },
  { href: "#pricing", label: "Programs" },
  { href: "#contact", label: "Letters" },
];

type EducationPremiumNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
  issueLabel?: string;
  issueDate?: string;
};

export function EducationPremiumNav({
  brandName = "Heritage",
  ctaLabel = "Subscribe",
  links = DEFAULT_LINKS,
  issueLabel = "Vol. XXIV · Issue 03",
  issueDate = "Autumn Term",
}: EducationPremiumNavProps) {
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
    <header data-v2-component="education-premium-nav" className="ed-masthead ed-paper">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>

      <div className="ed-masthead-top">
        <p className="ed-masthead-issue">{issueLabel}</p>
        <p className="ed-masthead-date">{issueDate}</p>
        <a href="#contact" className="ed-masthead-subscribe ed-focus-ring">
          {ctaLabel}
        </a>
      </div>

      <div className="ed-masthead-brand">
        <a href="#top" className="ed-masthead-title ed-font-display">
          {brandName}
        </a>
        <p className="ed-masthead-tagline">A journal of learning, research, and campus life</p>
      </div>

      <nav aria-label="Departments" className="ed-masthead-depts hidden lg:block">
        <ul className="ed-masthead-dept-list">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="ed-masthead-dept-link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="ed-masthead-mobile-bar lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="ed-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="ed-masthead-menu-btn ed-focus-ring"
        >
          <span aria-hidden className="flex flex-col gap-1">
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open ? (
        <nav id="ed-mobile-nav" aria-label="Mobile departments" className="ed-masthead-mobile lg:hidden">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
