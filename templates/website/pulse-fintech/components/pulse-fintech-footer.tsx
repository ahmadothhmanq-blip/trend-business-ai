"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Rails" },
  { href: "#pricing", label: "Plans" },
  { href: "#faq", label: "Compliance" },
  { href: "#contact", label: "Access" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type PulseFintechFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function PulseFintechFooter({
  brandName = "Pulse",
  tagline = "Settlement infrastructure for modern commerce.",
  links = DEFAULT_LINKS,
}: PulseFintechFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="pulse-fintech-footer" role="contentinfo" className="border-t border-[var(--border-subtle)] bg-[var(--color-background)] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="pu-font-mono text-sm font-semibold text-[var(--color-accent)]">{brandName.toUpperCase()}</p>
            <p className="pu-body mt-2 max-w-md text-sm">{tagline}</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-[var(--color-muted)]">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-[var(--color-accent)]">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-[96rem] font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
          © {year} · ALL SYSTEMS OPERATIONAL
        </p>
      </footer>
    </>
  );
}
