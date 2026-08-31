"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Modules" },
  { href: "#portfolio", label: "Figures" },
  { href: "#contact", label: "RFQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type ForgeIndustrialFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
  drawingId?: string;
};

export function ForgeIndustrialFooter({
  brandName = "Forge",
  tagline = "Industrial systems engineered for continuous operation.",
  links = DEFAULT_LINKS,
  drawingId = "DWG-01 / REV C",
}: ForgeIndustrialFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="forge-industrial-footer" role="contentinfo" className="fg-grid-paper border-t border-[var(--color-foreground)]">
        <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8">
          <div className="fg-title-block max-w-xl">
            <p>
              <span className="text-[var(--color-muted)]">Title · </span>
              {brandName}
            </p>
            <p>
              <span className="text-[var(--color-muted)]">Drawing · </span>
              {drawingId}
            </p>
            <p className="normal-case tracking-normal">{tagline}</p>
          </div>
          <nav aria-label="Footer" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="fg-font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-accent)]">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="fg-font-mono mt-8 text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            © {year} {brandName} · End of sheet
          </p>
        </div>
      </footer>
    </>
  );
}
