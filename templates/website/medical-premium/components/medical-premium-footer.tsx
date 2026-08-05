"use client";

const FOOTER_LINKS = [
  { href: "#specialties", label: "Specialties" },
  { href: "#physicians", label: "Physicians" },
  { href: "#appointments", label: "Appointments" },
  { href: "#contact", label: "Contact" },
];

type MedicalPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
};

export function MedicalPremiumFooter({
  brandName = "Aether Medical",
  tagline = "Private healthcare network",
}: MedicalPremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="medical-premium-footer"
      className="border-t border-[var(--border-subtle)] bg-[var(--color-primary)] text-[var(--color-pearl)]"
      role="contentinfo"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-healing)]/50 to-transparent" aria-hidden />
      <div className="mx-auto max-w-[76rem] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="mp-font-display text-2xl">{brandName}</p>
            <p className="mp-font-body mt-3 text-sm leading-relaxed text-white/60">{tagline}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["HIPAA Compliant", "JCI", "HIMSS"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-white/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="mp-eyebrow text-[var(--color-healing)]">Explore</p>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="mp-font-body text-sm text-white/70 transition hover:text-[var(--color-pearl)] mp-focus-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mp-eyebrow text-[var(--color-healing)]">Care line</p>
            <p className="mp-font-body mt-5">
              <a href="tel:+18005550199" className="text-lg text-[var(--color-pearl)] hover:underline mp-focus-ring">
                +1 (800) 555-0199
              </a>
            </p>
            <p className="mp-font-body mt-3 text-sm text-white/50">Mon–Fri 7am–8pm</p>
          </div>
        </div>
        <p className="mp-font-body mt-12 border-t border-white/8 pt-8 text-xs leading-relaxed text-white/40">
          © {year} {brandName}. This website does not provide medical advice. In an emergency, call 911.
        </p>
      </div>
    </footer>
  );
}
