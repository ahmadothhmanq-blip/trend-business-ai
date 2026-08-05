"use client";

const CHAPTERS = [
  { href: "#top", num: "01", label: "Begin" },
  { href: "#reservation", num: "02", label: "Reserve" },
  { href: "#chef", num: "03", label: "Chef" },
  { href: "#menu", num: "04", label: "Menu" },
  { href: "#signatures", num: "05", label: "Dishes" },
  { href: "#atmosphere", num: "06", label: "Room" },
  { href: "#gallery", num: "07", label: "Gallery" },
];

type RestaurantPremiumSidebarRailProps = {
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantPremiumSidebarRail({
  links,
}: RestaurantPremiumSidebarRailProps) {
  const items =
    links?.map((l, i) => ({
      href: l.href,
      num: String(i + 1).padStart(2, "0"),
      label: l.label,
    })) ?? CHAPTERS;

  return (
    <nav
      data-v2-component="restaurant-premium-sidebar-rail"
      aria-label="Page chapters"
      className="sticky top-28 hidden lg:block"
    >
      <p className="rp-eyebrow mb-8">Chapters</p>
      <ol className="space-y-1 border-s border-[var(--border-subtle)] ps-4">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="group flex items-baseline gap-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-copper)]"
            >
              <span className="rp-font-body text-[0.625rem] tabular-nums tracking-[0.2em] text-[var(--color-copper)]/70">
                {item.num}
              </span>
              <span className="rp-font-body text-[0.6875rem] uppercase tracking-[0.26em] text-[var(--color-muted)] transition group-hover:text-[var(--color-foreground)]">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-12 space-y-3 border-t border-[var(--border-subtle)] pt-8">
        <p className="rp-eyebrow">Hours</p>
        <p className="rp-font-body text-xs leading-relaxed text-[var(--color-muted)]">
          Tue–Sat · 6pm – 11pm
          <br />
          Sun · Closed
        </p>
        <a
          href="tel:+12125550188"
          className="rp-font-body inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-copper)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-copper)]"
        >
          +1 (212) 555-0188
        </a>
      </div>
    </nav>
  );
}
