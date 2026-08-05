"use client";

const DEFAULT_LINKS = [
  { href: "/platform", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/customers", label: "Customers" },
  { href: "#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

type SaasEnterpriseFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SaasEnterpriseFooter({
  brandName = "Northline",
  tagline = "Revenue command platform for enterprise GTM teams.",
  links = DEFAULT_LINKS,
}: SaasEnterpriseFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="saas-enterprise-footer"
      className="border-t border-[var(--border-default)] bg-[var(--color-ink,#020617)] text-white"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="se-font-display text-xl font-bold">{brandName}</p>
            <p className="se-font-body mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              {tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["SOC 2", "GDPR", "ISO 27001"].map((badge) => (
                <span
                  key={badge}
                  className="se-font-mono rounded-[var(--radius-sm)] border border-white/10 px-2.5 py-1 text-[0.625rem] text-white/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="se-eyebrow text-white/40">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="se-font-body text-sm text-white/65 transition hover:text-[var(--color-accent)] se-focus-ring rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="se-font-body text-xs text-white/40">
            © {year} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
