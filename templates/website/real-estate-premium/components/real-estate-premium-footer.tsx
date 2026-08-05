"use client";

const FOOTER_LINKS = [
  { href: "#collection", label: "Collection" },
  { href: "#neighborhoods", label: "Neighborhoods" },
  { href: "#architecture", label: "Architecture" },
  { href: "#advisors", label: "Advisors" },
  { href: "#inquire", label: "Inquire" },
];

type RealEstatePremiumFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function RealEstatePremiumFooter({
  brandName = "Prestige Estates",
  tagline = "Editorial luxury real estate advisory",
}: RealEstatePremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="real-estate-premium-footer"
      className="border-t border-[var(--color-brass)]/15 bg-[var(--color-primary)] text-[var(--color-linen)]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-14 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="rep-font-display text-4xl tracking-[0.02em]">{brandName}</p>
            <p className="rep-font-body mt-4 max-w-sm text-sm font-light leading-relaxed text-[var(--color-linen)]/55">
              {tagline}
            </p>
            <address className="rep-font-body mt-8 not-italic text-sm text-[var(--color-linen)]/40">
              900 Madison Avenue, New York
              <br />
              <a href="tel:+12125550100" className="mt-2 inline-block text-[var(--color-brass)] hover:underline">
                +1 (212) 555-0100
              </a>
            </address>
          </div>

          <nav aria-label="Footer navigation">
            <p className="rep-eyebrow text-[var(--color-linen)]/35">Explore</p>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rep-font-body text-sm text-[var(--color-linen)]/60 transition hover:text-[var(--color-brass)] rep-focus-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="rep-eyebrow text-[var(--color-linen)]/35">Markets</p>
            <ul className="rep-font-body mt-5 space-y-2 text-sm text-[var(--color-linen)]/55">
              <li>Manhattan</li>
              <li>Hamptons</li>
              <li>Aspen</li>
              <li>Palm Beach</li>
            </ul>
          </div>
        </div>

        <div className="rep-brass-rule-lg mt-16 opacity-30" />
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="rep-font-body text-[0.6875rem] uppercase tracking-[0.22em] text-[var(--color-linen)]/35">
            © {year} {brandName}. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="rep-font-body text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-linen)]/35 hover:text-[var(--color-brass)]"
            >
              Privacy
            </a>
            <a
              href="#"
              className="rep-font-body text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-linen)]/35 hover:text-[var(--color-brass)]"
            >
              Fair Housing
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
