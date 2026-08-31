"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type HotelResortPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function HotelResortPremiumFooter({
  brandName = "Haven",
  tagline = "Professional services with clarity, craft, and dependable delivery.",
  links = DEFAULT_LINKS,
}: HotelResortPremiumFooterProps) {
  const year = new Date().getFullYear();
  const navLinks = Array.isArray(links) && links.length ? links : DEFAULT_LINKS;

  return (
    <>
      <FlagshipRevealInit />
      <footer
      data-v2-component="hotel-resort-premium-footer"
      role="contentinfo"
      className="hr-footer-dark py-16 sm:py-20"
    >
      <div className="hr-container">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="hr-brand">{brandName}</p>
            {tagline ? <p className="hr-body-sm mt-3 max-w-md opacity-80">{tagline}</p> : null}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hr-caption hr-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="hr-caption mt-10 opacity-70">
          © {year} {brandName}. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  );
}
