"use client";

import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";

const DEFAULT_LINKS = [
  { href: "#features", label: "Rituals" },
  { href: "#about", label: "Philosophy" },
  { href: "#contact", label: "Visit" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type LuminaWellnessFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function LuminaWellnessFooter({
  brandName = "Lumina",
  tagline = "A house of quiet rituals for modern life.",
  links = DEFAULT_LINKS,
}: LuminaWellnessFooterProps) {
  const year = new Date().getFullYear();
  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="lumina-wellness-footer" role="contentinfo" className="lu-section text-center">
        <div className="mx-auto max-w-md px-5 sm:px-8">
          <p className="lu-font-display text-3xl font-medium">{brandName}</p>
          <p className="lu-body mx-auto mt-4 max-w-xs">{tagline}</p>
          <nav aria-label="Footer" className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="lu-font-body text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="mt-10 text-xs tracking-wide text-[var(--color-muted)]">
            © {year} {brandName}
          </p>
        </div>
      </footer>
    </>
  );
}
