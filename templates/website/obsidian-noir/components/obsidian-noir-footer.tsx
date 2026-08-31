"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Theses" },
  { href: "#about", label: "About" },
  { href: "#testimonials", label: "Voices" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type ObsidianNoirFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ObsidianNoirFooter({
  brandName = "Obsidian",
  tagline = "Permanence over noise.",
  links = DEFAULT_LINKS,
}: ObsidianNoirFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="obsidian-noir-footer" role="contentinfo" className="bg-[var(--color-background)] px-5 pb-16 pt-8 sm:px-8">
        <div className="mx-auto max-w-[72rem]">
          <hr className="ob-rule mb-12" />
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ob-font-display text-4xl text-[var(--color-foreground)] sm:text-5xl">{brandName}</p>
              <p className="ob-body mt-4 max-w-sm">{tagline}</p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="mt-12 text-xs tracking-[0.12em] text-[var(--color-muted)]">© {year}</p>
        </div>
      </footer>
    </>
  );
}
