"use client";

const DEFAULT_LINKS = [
  { href: "#shop", label: "Shop" },
  { href: "#collections", label: "Collections" },
  { href: "#about", label: "Our story" },
  { href: "#shipping", label: "Shipping" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

type EcommercePremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EcommercePremiumFooter({
  brandName = "Atelier",
  tagline = "Curated commerce for the considered home — objects of lasting value, sourced with intention.",
  links = DEFAULT_LINKS,
}: EcommercePremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="ecommerce-premium-footer"
      className="border-t border-[var(--border-default)] bg-[var(--color-ink,#12100E)] text-[var(--color-linen,#FAF8F5)]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[82rem] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="ec-font-display text-2xl">{brandName}</p>
            <p className="ec-font-body mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-linen,#FAF8F5)]/60">
              {tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Carbon neutral", "Artisan sourced", "Fair trade"].map((badge) => (
                <span
                  key={badge}
                  className="ec-font-body border border-[var(--color-champagne)]/25 px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.14em] text-[var(--color-champagne)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="ec-eyebrow text-[var(--color-champagne)]/70">Explore</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="ec-font-body text-sm text-[var(--color-linen,#FAF8F5)]/65 transition hover:text-[var(--color-champagne)] ec-focus-ring rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="ec-gold-rule mt-14 w-full max-w-none bg-gradient-to-r from-[var(--color-champagne)]/40 via-[var(--color-champagne)]/10 to-transparent" />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="ec-font-body text-xs text-[var(--color-linen,#FAF8F5)]/40">
            © {year} {brandName}. All rights reserved.
          </p>
          <p className="ec-font-body text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--color-champagne)]/50">
            Atelier Commerce · Est. 2018
          </p>
        </div>
      </div>
    </footer>
  );
}
