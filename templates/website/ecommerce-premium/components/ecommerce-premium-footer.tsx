"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Lookbook" },
  { href: "#portfolio", label: "Products" },
  { href: "#pricing", label: "Collections" },
  { href: "#contact", label: "Desk" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type EcommercePremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EcommercePremiumFooter({
  brandName = "Atelier",
  tagline = "Craft shown as a runway.",
  links = DEFAULT_LINKS,
}: EcommercePremiumFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="ecommerce-premium-footer" role="contentinfo" className="ec-footer">
        <div className="ec-footer-inner">
          <p className="ec-font-display ec-footer-brand">{brandName}</p>
          <p className="ec-footer-tag">{tagline}</p>
          <nav aria-label="Footer" className="ec-footer-nav">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <p className="ec-footer-copy">© {year}</p>
        </div>
      </footer>
    </>
  );
}
