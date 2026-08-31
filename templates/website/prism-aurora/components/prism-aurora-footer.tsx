"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#about", label: "About" },
  { href: "#portfolio", label: "Work" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type PrismAuroraFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function PrismAuroraFooter({
  brandName = "Prism",
  tagline = "Built for teams that compete globally.",
  links = DEFAULT_LINKS,
}: PrismAuroraFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="prism-aurora-footer" role="contentinfo" className="bg-[var(--color-background)] px-4 pb-10 pt-4 sm:px-6">
        <div className="pr-mosaic mx-auto max-w-[88rem]">
          <div className="pr-tile pr-tile-ink pr-span-8 flex flex-col justify-between gap-6">
            <p className="pr-font-display text-3xl font-extrabold tracking-[-0.04em] text-[var(--color-background)] sm:text-5xl">
              {brandName}
            </p>
            <p className="max-w-md text-sm text-[color-mix(in_srgb,var(--color-background)_72%,transparent)]">{tagline}</p>
          </div>
          <div className="pr-tile pr-span-4 flex flex-col justify-between gap-6">
            <nav aria-label="Footer" className="flex flex-col gap-2">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="pr-font-body text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                  {l.label}
                </a>
              ))}
            </nav>
            <p className="text-xs text-[var(--color-muted)]">© {year}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
