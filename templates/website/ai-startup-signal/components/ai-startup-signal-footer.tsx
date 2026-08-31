"use client";


import { FlagshipRevealInit } from "@/lib/website/template-v2/motion/flagship-reveal-init";
const DEFAULT_LINKS = {
  product: [
    { href: "#features", label: "Platform" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
    { href: "#stats", label: "Metrics" },
  ],
  company: [
    { href: "#about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "#contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/security", label: "Security" },
    { href: "/status", label: "Status" },
  ],
};

type FooterLink = { href: string; label: string };
type FooterGroups = typeof DEFAULT_LINKS;

function resolveLinks(links?: FooterGroups | FooterLink[]): FooterGroups {
  if (!links) return DEFAULT_LINKS;
  if (Array.isArray(links)) return { ...DEFAULT_LINKS, product: links };
  return { product: links.product ?? DEFAULT_LINKS.product, company: links.company ?? DEFAULT_LINKS.company, legal: links.legal ?? DEFAULT_LINKS.legal };
}

type AiStartupSignalFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: FooterGroups | FooterLink[];
};

export function AiStartupSignalFooter({
  brandName = "Signal",
  tagline = "AI infrastructure for teams shipping models at global scale.",
  links,
}: AiStartupSignalFooterProps) {
  const year = new Date().getFullYear();
  const groups = resolveLinks(links);

  return (
    <>
      <FlagshipRevealInit />
      <footer data-v2-component="ai-startup-signal-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-ink,#020617)] text-white">
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <p className="as-font-display text-xl font-bold">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">{tagline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["SOC 2", "GDPR", "HIPAA-ready"].map((b) => (
                <span key={b} className="rounded-full border border-white/10 px-2.5 py-1 text-[0.625rem] text-white/50">{b}</span>
              ))}
            </div>
          </div>
          {([["Product", groups.product], ["Company", groups.company], ["Legal", groups.legal]] as const).map(([title, items]) => (
            <nav key={title} aria-label={title}>
              <p className="as-font-mono text-[0.6875rem] uppercase tracking-wider text-white/40">{title}</p>
              <ul className="mt-4 space-y-2">
                {items.map((l) => (
                  <li key={l.href}><a href={l.href} className="text-sm text-white/65 hover:text-[var(--color-accent)]">{l.label}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 text-xs text-white/35">© {year} {brandName}</p>
      </div>
    </footer>
    </>
  );
}
