import { DEFAULT_FOOTER_LINKS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const FOOTER_GENERATORS = {
  "dark-split": darkSplit,
  "minimal-bar": minimalBar,
  "mega-columns": megaColumns,
  "centered-stack": centeredStack,
  "newsletter-band": newsletterBand,
  "luxury-minimal": luxuryMinimal,
  "resort-warm": resortWarm,
  "culinary-hours": culinaryHours,
  "academic-sitemap": academicSitemap,
  "shop-compact": shopCompact,
  "saas-compliance": saasCompliance,
  "portfolio-quote": portfolioQuote,
  "estate-contact": estateContact,
  "organic-rounded": organicRounded,
  "gradient-glow": gradientGlow,
  "terminal-minimal": terminalMinimal,
  "fintech-legal": fintechLegal,
  "industrial-stamp": industrialStamp,
  "law-formal": lawFormal,
  "wellness-calm": wellnessCalm,
};

export function generateFooter(entry, layoutKey) {
  const fn = FOOTER_GENERATORS[layoutKey] ?? darkSplit;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function footerHeader({ p, pkg, Pascal }) {
  return `"use client";

const DEFAULT_LINKS = ${JSON.stringify(DEFAULT_FOOTER_LINKS, null, 2)};

type ${Pascal}FooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ${Pascal}Footer({
  brandName = "Your Company",
  tagline = "Built for teams that compete globally.",
  links = DEFAULT_LINKS,
}: ${Pascal}FooterProps) {
  const year = new Date().getFullYear();`;
}

function darkSplit({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-ink,#020617)] text-white">
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="${p}-font-display text-xl font-bold">{brandName}</p>
            <p className="mt-3 max-w-sm text-sm text-white/60">{tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {links.map((l) => <li key={l.href}><a href={l.href} className="text-sm text-white/65 hover:text-[var(--color-accent)]">{l.label}</a></li>)}
            </ul>
          </nav>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/40">© {year} {brandName}</p>
      </div>
    </footer>
  );
}
`;
}

function minimalBar({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
        <p className="${p}-font-display text-sm font-bold uppercase tracking-widest">{brandName}</p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6">
          {links.map((l) => <a key={l.href} href={l.href} className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
        <p className="text-xs text-[var(--color-muted)]">© {year}</p>
      </div>
    </footer>
  );
}
`;
}

function megaColumns({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  const cols = [links.slice(0, 2), links.slice(2, 4), links.slice(4)];
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="${p}-section-alt bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[82rem] px-5 py-20 sm:py-28 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="${p}-font-display text-lg font-bold">{brandName}</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{tagline}</p>
          </div>
          {cols.map((group, i) => (
            <nav key={i} aria-label={\`Footer group \${i + 1}\`}>
              <ul className="space-y-2">
                {group.map((l) => <li key={l.href}><a href={l.href} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">{l.label}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 text-xs text-[var(--color-muted)]">© {year} {brandName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
`;
}

function centeredStack({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-[var(--color-background)] py-20 sm:py-28 text-center">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <p className="${p}-font-display text-2xl font-semibold">{brandName}</p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{tagline}</p>
        <nav aria-label="Footer" className="mt-8 flex flex-wrap justify-center gap-6">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
        </nav>
        <p className="mt-10 text-xs text-[var(--color-muted)]">© {year} {brandName}</p>
      </div>
    </footer>
  );
}
`;
}

function newsletterBand({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-[var(--color-primary)] text-[var(--color-foreground)]">
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="${p}-headline-sm">Stay in the loop</p>
            <p className="mt-2 text-sm opacity-80">{tagline}</p>
          </div>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Work email" aria-label="Email" className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-2 text-sm" />
            <button type="submit" className="${p}-btn-primary">Subscribe</button>
          </form>
        </div>
        <div className="mt-10 flex flex-wrap gap-6 border-t border-[var(--border-subtle)] pt-8">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm opacity-70">{l.label}</a>)}
          <span className="text-sm opacity-50">© {year} {brandName}</span>
        </div>
      </div>
    </footer>
  );
}
`;
}

function luxuryMinimal({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-[var(--color-background)] px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-6 border-t border-[var(--border-subtle)] pt-12 sm:flex-row">
        <p className="${p}-font-display text-sm tracking-[0.25em] uppercase">{brandName}</p>
        <nav aria-label="Footer" className="flex gap-8">
          {links.slice(0, 4).map((l) => <a key={l.href} href={l.href} className="text-xs tracking-wide text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
        <p className="text-xs text-[var(--color-muted)]">© {year}</p>
      </div>
    </footer>
  );
}
`;
}

function resortWarm({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-background)]">
      <div className="mx-auto max-w-[82rem] px-5 py-20 sm:py-28 text-center sm:px-8">
        <p className="${p}-font-display text-2xl">{brandName}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--color-muted)]">{tagline}</p>
        <nav aria-label="Footer" className="mt-8 flex flex-wrap justify-center gap-8">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
        </nav>
        <p className="mt-12 text-xs text-[var(--color-muted)]">© {year}</p>
      </div>
    </footer>
  );
}
`;
}

function culinaryHours({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="border-t-2 border-[var(--color-accent)]/30 bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-[82rem] gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          <p className="${p}-font-display text-lg font-bold">{brandName}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{tagline}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">Hours</p>
          <p className="mt-2 text-sm">Tue–Sun · 5pm–11pm</p>
          <p className="text-sm text-[var(--color-muted)]">Mon · Closed</p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2">
            {links.map((l) => <li key={l.href}><a href={l.href} className="text-sm">{l.label}</a></li>)}
          </ul>
        </nav>
      </div>
      <p className="border-t border-[var(--border-subtle)] py-4 text-center text-xs text-[var(--color-muted)]">© {year} {brandName}</p>
    </footer>
  );
}
`;
}

function academicSitemap({ p, pkg, Pascal }) {
  return megaColumns({ p, pkg, Pascal }).replace(
    `className="${p}-section-alt bg-[var(--color-surface)]"`,
    `className="border-t-4 border-[var(--color-accent)] bg-[var(--color-surface)]"`,
  );
}

function shopCompact({ p, pkg, Pascal }) {
  return minimalBar({ p, pkg, Pascal });
}

function saasCompliance({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-ink,#020617)] text-white">
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="${p}-font-display text-xl font-bold">{brandName}</p>
            <p className="mt-3 max-w-sm text-sm text-white/60">{tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["SOC 2", "GDPR", "ISO 27001"].map((b) => <span key={b} className="rounded border border-white/10 px-2 py-1 text-[0.625rem] text-white/50">{b}</span>)}
            </div>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-2">
              {links.map((l) => <li key={l.href}><a href={l.href} className="text-sm text-white/65">{l.label}</a></li>)}
            </ul>
          </nav>
        </div>
        <p className="mt-12 text-xs text-white/40">© {year} {brandName}</p>
      </div>
    </footer>
  );
}
`;
}

function portfolioQuote({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-[var(--color-primary)] px-5 py-20 sm:px-8">
      <blockquote className="mx-auto max-w-3xl text-center">
        <p className="${p}-display text-2xl sm:text-4xl">&ldquo;{tagline}&rdquo;</p>
        <footer className="mt-8 text-sm uppercase tracking-widest opacity-60">— {brandName}</footer>
      </blockquote>
      <nav aria-label="Footer" className="mt-12 flex flex-wrap justify-center gap-8">
        {links.map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
      </nav>
    </footer>
  );
}
`;
}

function estateContact({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-[82rem] gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        {["New York", "London", "Dubai"].map((city) => (
          <div key={city}>
            <p className="font-semibold">{city}</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">By appointment</p>
            <a href="#contact" className="mt-2 inline-block text-sm text-[var(--color-accent)]">Schedule visit</a>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border-default)] px-5 py-6 text-center text-xs text-[var(--color-muted)] sm:px-8">© {year} {brandName}</div>
    </footer>
  );
}
`;
}

function organicRounded({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="rounded-t-[3rem] bg-[var(--color-surface)] px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-[82rem] text-center">
        <p className="${p}-font-display text-xl">{brandName}</p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{tagline}</p>
        <nav aria-label="Footer" className="mt-8 flex flex-wrap justify-center gap-6">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
        </nav>
        <p className="mt-10 text-xs text-[var(--color-muted)]">© {year}</p>
      </div>
    </footer>
  );
}
`;
}

function gradientGlow({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="relative overflow-hidden bg-[var(--color-background)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--color-accent),transparent_70%)] opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-[82rem] px-5 py-20 sm:py-28 text-center sm:px-8">
        <p className="${p}-font-display text-xl font-bold">{brandName}</p>
        <nav aria-label="Footer" className="mt-8 flex flex-wrap justify-center gap-6">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
        <p className="mt-10 text-xs text-[var(--color-muted)]">© {year}</p>
      </div>
    </footer>
  );
}
`;
}

function terminalMinimal({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="border-t border-[var(--border-default)] bg-[var(--color-background)] font-mono text-xs">
      <div className="mx-auto flex max-w-[82rem] flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <span>~/ {brandName.toLowerCase()}</span>
        <nav aria-label="Footer" className="flex gap-4">
          {links.slice(0, 4).map((l) => <a key={l.href} href={l.href} className="text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
        <span className="text-[var(--color-muted)]">© {year}</span>
      </div>
    </footer>
  );
}
`;
}

function fintechLegal({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="bg-[#0a0f0a] font-mono text-[0.65rem] text-[#00ff88]/70">
      <div className="mx-auto max-w-[82rem] px-5 py-10 sm:px-8">
        <p className="text-[#00ff88]">{brandName}</p>
        <p className="mt-4 max-w-2xl leading-relaxed">{tagline}</p>
        <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <p className="mt-8 border-t border-[#00ff88]/20 pt-4">© {year} · Regulated entity · All rights reserved</p>
      </div>
    </footer>
  );
}
`;
}

function industrialStamp({ p, pkg, Pascal }) {
  return `${footerHeader({ p, pkg, Pascal })}
  return (
    <footer data-v2-component="${pkg}-footer" role="contentinfo" className="border-t-4 border-[var(--color-accent)] bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="${p}-font-display text-2xl font-black uppercase">{brandName}</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm font-bold uppercase">{l.label}</a>)}
        </nav>
      </div>
      <p className="bg-[var(--color-accent)] py-2 text-center text-xs font-bold uppercase text-[var(--color-background)]">© {year}</p>
    </footer>
  );
}
`;
}

function lawFormal({ p, pkg, Pascal }) {
  return megaColumns({ p, pkg, Pascal });
}

function wellnessCalm({ p, pkg, Pascal }) {
  return centeredStack({ p, pkg, Pascal });
}
