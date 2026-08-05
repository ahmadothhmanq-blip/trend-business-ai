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

type CreativePortfolioFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function CreativePortfolioFooter({
  brandName = "Kinetic Atelier",
  tagline = "Elite creative studio",
}: CreativePortfolioFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="creative-portfolio-footer"
      className="border-t border-[var(--border-default)] bg-[var(--color-background)]"
      role="contentinfo"
    >
      <div className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="cp-font-display text-2xl font-bold uppercase tracking-tight">{brandName}</p>
            <p className="cp-font-mono mt-2 text-xs uppercase tracking-widest text-[var(--color-zinc)]">
              {tagline}
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="cp-eyebrow">Navigate</p>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="cp-link-volt cp-font-mono text-xs uppercase tracking-widest">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Social">
            <p className="cp-eyebrow">Connect</p>
            <ul className="mt-4 space-y-2">
              {SOCIAL.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="cp-link-volt cp-font-mono text-xs uppercase tracking-widest"
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
        <p className="cp-font-mono mt-12 border-t border-[var(--border-subtle)] pt-6 text-[0.6875rem] uppercase tracking-widest text-[var(--color-zinc)]">
          © {year} {brandName}. Crafted with intention.
        </p>
      </div>
    </footer>
  );
}
