"use client";

const CHAPTERS = [
  { href: "#top", num: "01", label: "Begin" },
  { href: "#reserve", num: "02", label: "Reserve" },
  { href: "#chef", num: "03", label: "Chef" },
  { href: "#menu", num: "04", label: "Menu" },
  { href: "#dishes", num: "05", label: "Dishes" },
  { href: "#atmosphere", num: "06", label: "Room" },
  { href: "#gallery", num: "07", label: "Gallery" },
];

type RestaurantSignatureSidebarRailProps = {
  links?: Array<{ href: string; label: string }>;
};

export function RestaurantSignatureSidebarRail({
  links,
}: RestaurantSignatureSidebarRailProps) {
  const items =
    links?.map((l, i) => ({
      href: l.href,
      num: String(i + 1).padStart(2, "0"),
      label: l.label,
    })) ?? CHAPTERS;

  return (
    <nav
      data-v2-component="restaurant-signature-sidebar-rail"
      aria-label="Page chapters"
      className="sticky top-28 hidden lg:block"
    >
      <p className="rs-eyebrow mb-8">Chapters</p>
      <ol className="space-y-1 border-s border-[var(--border-subtle)] ps-4">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="group flex items-baseline gap-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-copper)]"
            >
              <span className="rs-font-body text-[0.625rem] tabular-nums tracking-[0.2em] text-[var(--color-copper)]/70">
                {item.num}
              </span>
              <span className="rs-font-body text-[0.6875rem] uppercase tracking-[0.26em] text-[var(--color-muted)] transition group-hover:text-[var(--color-foreground)]">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-12 space-y-3 border-t border-[var(--border-subtle)] pt-8">
        <p className="rs-eyebrow">Hours</p>
        <p className="rs-font-body text-xs leading-relaxed text-[var(--color-muted)]">
          Tue–Sat · 18:00–23:00
          <br />
          Sun · 12:00–15:00
        </p>
        <a
          href="tel:+1234567890"
          className="rs-font-body inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-copper)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-copper)]"
        >
          +1 (234) 567-890
        </a>
      </div>
    </nav>
  );
}
