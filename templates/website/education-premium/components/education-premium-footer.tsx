"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Departments" },
  { href: "#about", label: "Essay" },
  { href: "#portfolio", label: "Campus notes" },
  { href: "#pricing", label: "Programs" },
  { href: "#contact", label: "Letters" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type EducationPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EducationPremiumFooter({
  brandName = "Heritage",
  tagline = "A journal of learning, research, and campus life.",
  links = DEFAULT_LINKS,
}: EducationPremiumFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="education-premium-footer" role="contentinfo" className="ed-footer ed-paper">
        <div className="ed-footer-inner">
          <div className="ed-footer-brand">
            <p className="ed-font-display ed-footer-title">{brandName}</p>
            <p className="ed-footer-tagline">{tagline}</p>
          </div>
          <nav aria-label="Footer" className="ed-footer-nav">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <p className="ed-footer-copy">
            © {year} {brandName}. Printed for the community.
          </p>
        </div>
      </footer>
    </>
  );
}
