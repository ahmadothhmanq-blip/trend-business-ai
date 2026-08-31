"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#about", label: "About" },
  { href: "#portfolio", label: "Work" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type RestaurantPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantPremiumFooter({
  brandName = "Ember",
  tagline = "Global-grade partnerships built on clarity, craft, and dependable delivery.",
  links = DEFAULT_LINKS,
}: RestaurantPremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="restaurant-premium-footer" role="contentinfo" className="rp-footer">
        <div className="rp-shell rp-footer-grid">
          <div>
            <p className="rp-brand">{brandName}</p>
            {tagline ? <p className="rp-footer-tag">{tagline}</p> : null}
          </div>
          <nav aria-label="Footer" className="rp-footer-nav">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="rp-shell">
          <p className="rp-footer-copy">
            © {year} {brandName}. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
