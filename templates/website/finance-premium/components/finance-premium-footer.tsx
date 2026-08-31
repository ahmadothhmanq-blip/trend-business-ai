"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";
const FOOTER_LINKS = {
  advisory: [
    { href: "#features", label: "Services" },
    { href: "#portfolio", label: "Mandates" },
    { href: "#pricing", label: "Programs" },
  ],
  firm: [
    { href: "#about", label: "The firm" },
    { href: "#stats", label: "Impact" },
    { href: "#contact", label: "Advisors" },
  ],
  legal: [
    { href: "#", label: "Form ADV" },
    { href: "#", label: "Privacy" },
    { href: "#", label: "Disclosures" },
  ],
};

type FinancePremiumFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function FinancePremiumFooter({
  brandName = "Ledger",
  tagline = "Independent capital advisory since 1987.",
}: FinancePremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="finance-premium-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-primary)] text-white">
      <div className="mx-auto max-w-[82rem] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <p className="fn-font-display text-xl font-semibold">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm text-white/65">{tagline}</p>
            <p className="mt-6 fn-font-mono text-[0.625rem] uppercase tracking-wider text-white/45">SEC Registered · FCA Authorized</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <nav key={group} aria-label={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">{group}</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-white/70 transition hover:text-white">{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 border-t border-white/10 pt-8 text-xs text-white/45">
          © {year} {brandName} Capital Advisors. All rights reserved. Past performance is not indicative of future results.
        </p>
      </div>
    </footer>
    </>
  );
}
