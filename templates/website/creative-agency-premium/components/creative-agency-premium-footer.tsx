"use client";

const FOOTER_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#studio", label: "Studio" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

const SOCIAL = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://behance.net", label: "Behance" },
  { href: "https://linkedin.com", label: "LinkedIn" },
];

type CreativeAgencyPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function CreativeAgencyPremiumFooter({
  brandName = "Studio Volt",
  tagline = "Portfolio-forward creative studio",
}: CreativeAgencyPremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="creative-agency-premium-footer"
      className="border-t border-[var(--border-default)] bg-[var(--color-background)]"
      role="contentinfo"
    >
      <div className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-14 border-b border-[var(--border-subtle)] pb-14">
          <p className="sv-font-display text-[clamp(2.5rem,8vw,5rem)] font-bold uppercase leading-[0.9] tracking-tighter text-[var(--color-surface)]">
            {brandName}
          </p>
          <p className="sv-font-mono mt-4 text-xs uppercase tracking-[0.28em] text-[var(--color-zinc)] opacity-70">
            {tagline}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <nav aria-label="Footer">
            <p className="sv-eyebrow">Navigate</p>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.map((link, i) => (
                <li key={link.href}>
                  <a href={link.href} className="sv-link-volt sv-font-mono flex items-baseline gap-3 text-xs uppercase tracking-widest">
                    <span className="text-[var(--color-volt)]">{String(i + 1).padStart(2, "0")}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Social">
            <p className="sv-eyebrow">Connect</p>
            <ul className="mt-5 space-y-3">
              {SOCIAL.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="sv-link-volt sv-font-mono text-xs uppercase tracking-widest"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="sv-font-mono mt-14 border-t border-[var(--border-subtle)] pt-8 text-[0.6875rem] uppercase tracking-widest text-[var(--color-zinc)] opacity-70">
          © {year} {brandName}. Crafted with intention.
        </p>
      </div>
    </footer>
  );
}
