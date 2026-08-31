"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Modules" },
  { href: "#pricing", label: "Plans" },
  { href: "#faq", label: "Docs" },
  { href: "#contact", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type SaasEnterpriseFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SaasEnterpriseFooter({
  brandName = "Nexus",
  tagline = "The revenue workspace that looks like the product.",
  links = DEFAULT_LINKS,
}: SaasEnterpriseFooterProps) {
  const year = new Date().getFullYear();
  const navLinks = Array.isArray(links) && links.length ? links : DEFAULT_LINKS;
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="saas-enterprise-footer" role="contentinfo" className="se-footer">
        <div className="se-docs-inner se-footer-inner">
          <div>
            <p className="se-font-display se-footer-brand">{brandName}</p>
            <p className="se-footer-tag">{tagline}</p>
          </div>
          <nav aria-label="Footer" className="se-footer-nav">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <p className="se-footer-copy">
            © {year} {brandName}
          </p>
        </div>
      </footer>
    </>
  );
}
