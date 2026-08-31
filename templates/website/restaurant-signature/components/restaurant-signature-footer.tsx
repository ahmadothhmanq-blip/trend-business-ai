"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Courses" },
  { href: "#about", label: "Chef" },
  { href: "#contact", label: "Reserve" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type RestaurantSignatureFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantSignatureFooter({
  brandName = "Forest",
  tagline = "Tasting menu · seasonal spine",
  links = DEFAULT_LINKS,
}: RestaurantSignatureFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="restaurant-signature-footer" role="contentinfo" className="rs-menu-footer">
        <p className="rs-menu-footer-brand">{brandName}</p>
        <p className="rs-menu-footer-tag">{tagline}</p>
        <nav aria-label="Footer">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="mt-8 text-xs text-[var(--color-muted)]">© {year}</p>
      </footer>
    </>
  );
}
