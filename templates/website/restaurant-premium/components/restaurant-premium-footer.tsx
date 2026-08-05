"use client";

const FOOTER_LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Chef", href: "#chef" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reserve", href: "#reservation" },
];

type RestaurantPremiumFooterProps = {
  brandName?: string;
  tagline?: string;
  address?: string;
};

export function RestaurantPremiumFooter({
  brandName = "Ember Table",
  tagline = "Contemporary fine dining · West Village",
  address = "48 West 10th Street, New York, NY",
}: RestaurantPremiumFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      data-v2-component="restaurant-premium-footer"
      className="border-t border-[var(--border-subtle)] bg-[var(--color-background)]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="rp-font-display text-3xl text-[var(--color-foreground)]">{brandName}</p>
            <p className="rp-font-body mt-2 text-sm text-[var(--color-muted)]">{tagline}</p>
            <address className="rp-font-body mt-6 not-italic text-sm leading-relaxed text-[var(--color-muted)]">
              {address}
            </address>
          </div>

          <nav aria-label="Footer navigation">
            <p className="rp-eyebrow mb-4">Explore</p>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rp-font-body text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-copper)] focus:outline-none focus-visible:text-[var(--color-copper)] focus-visible:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="rp-eyebrow mb-4">Hours</p>
            <dl className="rp-font-body space-y-2 text-sm text-[var(--color-muted)]">
              <div className="flex justify-between gap-4">
                <dt>Tue – Thu</dt>
                <dd>6pm – 10pm</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Fri – Sat</dt>
                <dd>5:30pm – 11pm</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Sunday</dt>
                <dd>Closed</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rp-copper-rule mt-16" />
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="rp-font-body text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
            © {year} {brandName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="rp-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-copper)] focus:outline-none focus-visible:underline"
            >
              Instagram
            </a>
            <a
              href="#"
              className="rp-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-copper)] focus:outline-none focus-visible:underline"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
