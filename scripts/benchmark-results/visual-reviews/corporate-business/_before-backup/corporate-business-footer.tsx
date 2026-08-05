"use client";

const EXPLORE_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#about", label: "About" },
  { href: "#customers", label: "Outcomes" },
  { href: "#pricing", label: "Engagements" },
  { href: "#contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "#privacy", label: "Privacy" },
  { href: "#terms", label: "Terms" },
  { href: "#cookies", label: "Cookies" },
];

type CorporateBusinessFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function CorporateBusinessFooter({
  brandName = "Meridian Advisory",
  tagline = "Executive advisory for organizations navigating transformation, governance, and global growth.",
}: CorporateBusinessFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="corporate-business-footer"
      className="cb-section-ink relative overflow-hidden"
      role="contentinfo"
    >
      <div className="cb-grid-bg pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-signal)]/30 to-transparent"
        aria-hidden
      />

      <div className="cb-container relative">
        <div className="grid gap-16 border-b border-white/8 pb-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <a href="#top" className="cb-font-display inline-flex items-center gap-3.5 text-2xl font-medium text-white cb-focus-ring">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-signal)]/40 text-sm text-[var(--color-signal)]"
                aria-hidden
              >
                M
              </span>
              {brandName}
            </a>
            <p className="cb-font-body mt-6 max-w-xs text-sm leading-[1.75] text-white/50">{tagline}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["ISO 9001", "GDPR", "SOC 2"].map((badge) => (
                <span
                  key={badge}
                  className="cb-font-mono rounded-full border border-white/10 px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.14em] text-white/40"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-6">
            <p className="cb-font-body text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/35">
              Explore
            </p>
            <ul className="mt-5 space-y-3.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="cb-font-body text-sm text-white/55 transition hover:text-[var(--color-signal)] cb-focus-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <p className="cb-font-body text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/35">
              Offices
            </p>
            <ul className="cb-font-body mt-5 space-y-3 text-sm text-white/50">
              <li>
                <span className="block text-white/70">New York</span>
                200 Park Avenue
              </li>
              <li>
                <span className="block text-white/70">London</span>
                30 St Mary Axe
              </li>
              <li>
                <span className="block text-white/70">Dubai</span>
                DIFC Gate Village
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="cb-font-body text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/35">
              Insights
            </p>
            <p className="cb-font-body mt-5 text-sm leading-relaxed text-white/50">
              Quarterly perspectives on governance, transformation, and global markets.
            </p>
            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="cb-footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="cb-footer-email"
                type="email"
                placeholder="Work email"
                className="cb-input flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/30"
              />
              <button type="submit" className="cb-btn-primary shrink-0 px-5 text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="cb-font-body text-xs text-white/30">
            © {year} {brandName}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-6">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="cb-font-body text-xs text-white/30 transition hover:text-white/55 cb-focus-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
