"use client";

const DEFAULT_LINKS = [
  { href: "#features", label: "Academics" },
  { href: "#about", label: "About" },
  { href: "#pricing", label: "Tuition" },
  { href: "#contact", label: "Admissions" },
  { href: "#privacy", label: "Privacy" },
  { href: "#terms", label: "Terms" },
];

type EducationPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function EducationPremiumFooter({
  brandName = "Scholar's Hall",
  tagline = "A premier research university where academic excellence, intellectual curiosity, and global citizenship shape tomorrow's leaders.",
  links = DEFAULT_LINKS,
}: EducationPremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="education-premium-footer"
      className="border-t border-[var(--border-default)] bg-[var(--color-ink,#0F1829)] text-white"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="ed-font-display text-xl font-semibold">{brandName}</p>
            <p className="ed-font-body mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              {tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["AACSB", "ABET", "Fulbright"].map((badge) => (
                <span
                  key={badge}
                  className="ed-font-mono rounded-[var(--radius-sm)] border border-white/10 px-2.5 py-1 text-[0.625rem] text-white/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="ed-eyebrow text-white/40">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="ed-font-body text-sm text-white/65 transition hover:text-[var(--color-accent)] ed-focus-ring rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="ed-font-body text-xs text-white/40">
            © {year} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
