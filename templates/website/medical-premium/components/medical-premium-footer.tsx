"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type MedicalPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function MedicalPremiumFooter({
  brandName = "Brand",
  tagline = "Professional services with clarity, craft, and dependable delivery.",
  links = DEFAULT_LINKS,
}: MedicalPremiumFooterProps) {
  const year = new Date().getFullYear();


  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="medical-premium-footer" role="contentinfo" className="bg-[var(--color-background)] py-20 sm:py-28">
      <div className="mp-container">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-[var(--border-subtle)] pt-12 lg:flex-row lg:items-center">
          <div>
            <p className="mp-brand">{brandName}</p>
            {tagline ? <p className="mp-body-sm mt-3 max-w-md">{tagline}</p> : null}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-8">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="mp-caption hover:text-[var(--color-foreground)]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="mp-caption mt-10">
          © {year} {brandName}. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  );
}
