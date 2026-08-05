"use client";

const FOOTER_LINKS = [
  { label: "Suites", href: "#suites" },
  { label: "Experiences", href: "#experiences" },
  { label: "Gallery", href: "#gallery" },
  { label: "Book", href: "#reservation" },
];

type HotelResortPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  address?: string;
};

export function HotelResortPremiumFooter({
  brandName = "Azure Haven",
  tagline = "Coastal luxury resort · Indian Ocean",
  address = "Azure Haven Private Reserve, Maldives",
}: HotelResortPremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="hotel-resort-premium-footer"
      className="border-t border-[var(--border-subtle)] bg-[var(--color-background)]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="hr-font-display text-3xl text-[var(--color-foreground)]">{brandName}</p>
            <p className="hr-font-body mt-2 text-sm text-[var(--color-muted)]">{tagline}</p>
            <address className="hr-font-body mt-6 not-italic text-sm leading-relaxed text-[var(--color-muted)]">
              {address}
            </address>
          </div>

          <nav aria-label="Footer navigation">
            <p className="hr-eyebrow mb-4">Explore</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hr-font-body text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-azure)] focus:outline-none focus-visible:text-[var(--color-azure)] focus-visible:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="hr-eyebrow mb-4">Concierge</p>
            <dl className="hr-font-body space-y-2 text-sm text-[var(--color-muted)]">
              <div className="flex justify-between gap-4">
                <dt>Check-in</dt>
                <dd>3:00 pm</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Check-out</dt>
                <dd>11:00 am</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Concierge</dt>
                <dd>24 hours</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="hr-azure-rule mt-16" />
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="hr-font-body text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            © {year} {brandName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="hr-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-azure)] focus:outline-none focus-visible:underline"
            >
              Instagram
            </a>
            <a
              href="#"
              className="hr-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-azure)] focus:outline-none focus-visible:underline"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
