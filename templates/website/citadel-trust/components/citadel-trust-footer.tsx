"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Charter" },
  { href: "#about", label: "The firm" },
  { href: "#portfolio", label: "Matters" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type CitadelTrustFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function CitadelTrustFooter({
  brandName = "Citadel",
  tagline = "Institutional counsel for matters that define markets and nations.",
  links = DEFAULT_LINKS,
}: CitadelTrustFooterProps) {
  const year = new Date().getFullYear();
  const navLinks = Array.isArray(links) && links.length ? links : DEFAULT_LINKS;
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="citadel-trust-footer" role="contentinfo" className="ct-dossier border-t border-[var(--border-default)]">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <div className="ct-doc">
            <p className="ct-doc-ribbon">
              <span className="ct-doc-seal-mark" aria-hidden />
              Colophon
            </p>
            <p className="ct-font-display text-2xl font-semibold">{brandName}</p>
            <p className="ct-body mt-3">{tagline}</p>
            <nav aria-label="Footer" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                  {link.label}
                </a>
              ))}
            </nav>
            <p className="mt-10 text-xs text-[var(--color-muted)]">
              © {year} {brandName} LLP. Attorney advertising.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
