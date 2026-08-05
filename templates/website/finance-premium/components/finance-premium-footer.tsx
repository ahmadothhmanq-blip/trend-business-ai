"use client";

const DEFAULT_LINKS = [
  { href: "#features", label: "Capabilities" },
  { href: "#about", label: "Philosophy" },
  { href: "#pricing", label: "Engagements" },
  { href: "#contact", label: "Contact" },
  { href: "#privacy", label: "Privacy" },
  { href: "#terms", label: "Terms" },
];

type FinancePremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function FinancePremiumFooter({
  brandName = "Meridian Capital",
  tagline = "Private wealth management and institutional advisory for families and enterprises who demand discretion, rigor, and generational thinking.",
  links = DEFAULT_LINKS,
}: FinancePremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="finance-premium-footer"
      className="border-t border-[var(--border-accent)] bg-[var(--color-ink)] text-[var(--color-background)]"
      role="contentinfo"
    >
      <div className="fn-gold-rule mx-auto max-w-[82rem] opacity-30" aria-hidden />
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="fn-font-display text-xl font-semibold text-[var(--color-background)]">{brandName}</p>
            <p className="fn-font-body mt-3 max-w-sm text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">
              {tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["SEC Registered", "FIDIC", "CFA Institute"].map((badge) => (
                <span
                  key={badge}
                  className="fn-font-mono rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-signal)_35%,transparent)] px-2.5 py-1 text-[0.625rem] text-[var(--color-signal)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="fn-eyebrow text-[color-mix(in_srgb,var(--color-background)_45%,transparent)]">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="fn-font-body text-sm text-[color-mix(in_srgb,var(--color-background)_70%,transparent)] transition hover:text-[var(--color-signal)] fn-focus-ring rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-[color-mix(in_srgb,var(--color-background)_12%,transparent)] pt-6">
          <p className="fn-font-body text-xs text-[color-mix(in_srgb,var(--color-background)_45%,transparent)]">
            © {year} {brandName}. All rights reserved. Investment advisory services offered through Meridian Capital Advisors, LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
