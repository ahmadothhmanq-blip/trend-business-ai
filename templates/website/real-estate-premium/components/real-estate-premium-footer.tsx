"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#portfolio", label: "Listings" },
  { href: "#about", label: "Advisory" },
  { href: "#contact", label: "Inquire" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type RealEstatePremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function RealEstatePremiumFooter({
  brandName = "Estates",
  tagline = "Property dossiers by appointment.",
  links = DEFAULT_LINKS,
}: RealEstatePremiumFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="real-estate-premium-footer" role="contentinfo" className="rep-footer">
        <div className="rep-footer-grid">
          {["New York", "London", "Dubai"].map((city) => (
            <div key={city}>
              <p>{city}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">By appointment</p>
              <a href="#contact" className="mt-2 inline-block text-sm text-[var(--color-accent)]">
                Schedule visit
              </a>
            </div>
          ))}
        </div>
        <div className="rep-footer-meta">
          <span>
            © {year} {brandName} — {tagline}
          </span>
          <nav aria-label="Footer" className="flex flex-wrap gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-[var(--color-accent)]">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
