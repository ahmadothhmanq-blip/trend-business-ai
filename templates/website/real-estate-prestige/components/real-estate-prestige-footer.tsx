"use client";

const FOOTER_LINKS = [
  { href: "#collection", label: "Collection" },
  { href: "#neighborhoods", label: "Neighborhoods" },
  { href: "#advisors", label: "Advisors" },
  { href: "#inquire", label: "Inquire" },
];

type RealEstatePrestigeFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function RealEstatePrestigeFooter({
  brandName = "Monolith Estate",
  tagline = "Ultra-premium real estate advisory",
}: RealEstatePrestigeFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="real-estate-prestige-footer"
      className="border-t border-[var(--border-subtle)] bg-[var(--color-primary)] text-[var(--color-linen)]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="rep-font-display text-3xl">{brandName}</p>
            <p className="rep-font-body mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              {tagline}
            </p>
            <address className="rep-font-body mt-6 not-italic text-sm text-white/50">
              900 Madison Avenue, New York
            </address>
          </div>

          <nav aria-label="Footer navigation">
            <p className="rep-eyebrow text-white/40">Explore</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rep-font-body text-sm text-white/65 transition hover:text-[var(--color-brass)] rep-focus-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rep-brass-rule mt-14 opacity-40" />
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="rep-font-body text-[0.6875rem] uppercase tracking-[0.22em] text-white/40">
            © {year} {brandName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="rep-font-body text-[0.6875rem] uppercase tracking-[0.18em] text-white/40 hover:text-[var(--color-brass)]">
              Privacy
            </a>
            <a href="#" className="rep-font-body text-[0.6875rem] uppercase tracking-[0.18em] text-white/40 hover:text-[var(--color-brass)]">
              Fair Housing
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
