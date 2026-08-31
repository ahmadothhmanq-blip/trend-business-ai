"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";
const LINKS = [
  { href: "#portfolio", label: "Work" },
  { href: "#features", label: "Services" },
  { href: "#about", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

export function CreativeAgencyPremiumFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="creative-agency-premium-footer" role="contentinfo" className="border-t border-[var(--border-default)] py-12">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="sv-font-display text-base font-semibold text-[var(--color-ghost)] [text-transform:none]">Volt</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">New York · London · Singapore · Tokyo</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ghost)]">{l.label}</a>
          ))}
        </nav>
        <p className="text-xs text-[var(--color-muted)]">© {year}</p>
      </div>
    </footer>
    </>
  );
}
