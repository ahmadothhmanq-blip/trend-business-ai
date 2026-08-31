"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#filmstrip", label: "Work" },
  { href: "#about", label: "Colophon" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type CreativePortfolioFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CreativePortfolioFooter({
  brandName = "Kinetic",
  tagline = "Horizontal stages. Vertical colophon.",
  links = DEFAULT_LINKS,
}: CreativePortfolioFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="creative-portfolio-footer" role="contentinfo" className="cp-footer">
        <div className="cp-footer-inner">
          <div>
            <p className="cp-footer-brand">{brandName}</p>
            <p className="cp-footer-tag">{tagline}</p>
            <p className="mt-4 cp-font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[var(--color-muted)]">
              © {year}
            </p>
          </div>
          <nav aria-label="Footer">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
