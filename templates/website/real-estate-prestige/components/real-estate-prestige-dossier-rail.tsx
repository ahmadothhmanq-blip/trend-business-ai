"use client";

const DOSSIER_ITEMS = [
  { href: "#collection", label: "Collection" },
  { href: "#neighborhoods", label: "Neighborhoods" },
  { href: "#architecture", label: "Architecture" },
  { href: "#advisors", label: "Advisors" },
  { href: "#inquire", label: "Inquire" },
];

type RealEstatePrestigeDossierRailProps = {
  links?: Array<{ href: string; label: string }>;
};

export function RealEstatePrestigeDossierRail({
  links,
}: RealEstatePrestigeDossierRailProps) {
  const items = links ?? DOSSIER_ITEMS;

  return (
    <nav
      data-v2-component="real-estate-prestige-dossier-rail"
      aria-label="Property dossier"
      className="sticky top-28 hidden lg:block"
    >
      <p className="rep-eyebrow mb-6">Dossier</p>

      <dl className="mb-10 space-y-4 border-b border-[var(--border-subtle)] pb-8">
        <div>
          <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Price range
          </dt>
          <dd className="rep-font-display mt-1 text-xl text-[var(--color-foreground)]">
            $4.2M – $28M
          </dd>
        </div>
        <div>
          <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Available
          </dt>
          <dd className="rep-font-display mt-1 text-xl text-[var(--color-brass)]">12 residences</dd>
        </div>
        <div>
          <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Markets
          </dt>
          <dd className="rep-font-body mt-1 text-sm text-[var(--color-foreground)]">
            Manhattan · Hamptons · Aspen
          </dd>
        </div>
      </dl>

      <ol className="space-y-1">
        {items.map((item, i) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="group flex items-center gap-3 py-2 transition rep-focus-ring"
            >
              <span className="rep-font-body text-[0.625rem] tabular-nums tracking-[0.16em] text-[var(--color-brass)]/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="rep-font-body text-[0.6875rem] uppercase tracking-[0.22em] text-[var(--color-muted)] transition group-hover:text-[var(--color-foreground)]">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-12 border-t border-[var(--border-subtle)] pt-8">
        <p className="rep-eyebrow mb-3">Concierge</p>
        <a
          href="tel:+12125550100"
          className="rep-font-body text-sm text-[var(--color-brass)] hover:underline rep-focus-ring"
        >
          +1 (212) 555-0100
        </a>
      </div>
    </nav>
  );
}
