"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#top", label: "Workspace" },
  { href: "#features", label: "Modules" },
  { href: "#pricing", label: "Plans" },
  { href: "#faq", label: "Docs" },
  { href: "#contact", label: "Support" },
];

type SaasEnterpriseNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SaasEnterpriseNav({
  brandName = "Nexus",
  ctaLabel = "Start trial",
  links = DEFAULT_LINKS,
}: SaasEnterpriseNavProps) {
  const navLinks = Array.isArray(links) && links.length ? links : DEFAULT_LINKS;
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
    <header data-v2-component="saas-enterprise-nav" className="se-app-topbar">
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>
      <div className="se-app-topbar-inner">
        <div className="se-app-topbar-left">
          <a href="#top" className="se-app-mark se-font-display">
            {brandName}
          </a>
          <span className="se-app-env" aria-hidden>
            Production
          </span>
        </div>
        <nav aria-label="App sections" className="se-app-topbar-nav hidden lg:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="se-app-topbar-right">
          <a href="#contact" className="se-btn-primary se-focus-ring hidden sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="se-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="se-app-menu-btn lg:hidden se-focus-ring"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav id="se-mobile-nav" aria-label="Mobile" className="se-app-mobile lg:hidden">
          <ul>
            {navLinks.map((link) => (
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
