"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

type RealEstatePrestigeFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RealEstatePrestigeFooter({
  brandName = "Brand",
  tagline = "Professional services with clarity, craft, and dependable delivery.",
  links = DEFAULT_FOOTER_LINKS,
}: RealEstatePrestigeFooterProps) {
  const year = new Date().getFullYear();


  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="real-estate-prestige-footer" role="contentinfo" className="bg-[var(--color-background)] py-20 sm:py-28">
      <div className="rep-container">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-[var(--border-subtle)] pt-12 lg:flex-row lg:items-center">
          <div>
            <p className="rep-brand">{brandName}</p>
            {tagline ? <p className="rep-body-sm mt-3 max-w-md">{tagline}</p> : null}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-8">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="rep-caption hover:text-[var(--color-foreground)]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="rep-caption mt-10">
          © {year} {brandName}. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  );
}
