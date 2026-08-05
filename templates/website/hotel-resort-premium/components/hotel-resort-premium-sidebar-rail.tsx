"use client";

const CHAPTERS = [
  { href: "#top", num: "01", label: "Arrive" },
  { href: "#reservation", num: "02", label: "Book" },
  { href: "#suites", num: "03", label: "Suites" },
  { href: "#experiences", num: "04", label: "Experiences" },
  { href: "#philosophy", num: "05", label: "Philosophy" },
  { href: "#sanctuary", num: "06", label: "Sanctuary" },
  { href: "#gallery", num: "07", label: "Gallery" },
];

type HotelResortPremiumSidebarRailProps = {
  links?: Array<{ href: string; label: string }>;
};

export function HotelResortPremiumSidebarRail({
  links,
}: HotelResortPremiumSidebarRailProps) {
  const items =
    links?.map((l, i) => ({
      href: l.href,
      num: String(i + 1).padStart(2, "0"),
      label: l.label,
    })) ?? CHAPTERS;

  return (
    <nav
      data-v2-component="hotel-resort-premium-sidebar-rail"
      aria-label="Page chapters"
      className="sticky top-28 hidden lg:block"
    >
      <p className="hr-eyebrow mb-8">Chapters</p>
      <ol className="space-y-1 border-s border-[var(--border-subtle)] ps-4">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="group flex items-baseline gap-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-azure)]"
            >
              <span className="hr-font-body text-[0.625rem] tabular-nums tracking-[0.2em] text-[var(--color-azure)]/70">
                {item.num}
              </span>
              <span className="hr-font-body text-[0.6875rem] uppercase tracking-[0.26em] text-[var(--color-muted)] transition group-hover:text-[var(--color-foreground)]">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-12 space-y-3 border-t border-[var(--border-subtle)] pt-8">
        <p className="hr-eyebrow">Concierge</p>
        <p className="hr-font-body text-xs leading-relaxed text-[var(--color-muted)]">
          24 hours · Villa service
          <br />
          Airport transfers on request
        </p>
        <a
          href="tel:+18005550188"
          className="hr-font-body inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-azure)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-azure)]"
        >
          +1 (800) 555-0188
        </a>
      </div>
    </nav>
  );
}
