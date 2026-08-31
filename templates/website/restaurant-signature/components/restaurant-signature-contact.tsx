"use client";

type RestaurantSignatureContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function RestaurantSignatureContact({
  eyebrow = "Reservations",
  title = "Request a table",
  subtitle = "Share your preferred evening — the book replies within one day.",
  email = "book@forest.table",
  phone = "+1 (555) 000-0000",
  address = "By the woodland edge — seating from 18:00",
  submitLabel = "Request seating",
}: RestaurantSignatureContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="restaurant-signature-contact"
      className="rs-menu-doc rs-reveal"
      style={{ paddingTop: "0", borderTop: "0" }}
    >
      <div className="rs-menu-reserve">
        <p className="rs-menu-section-label">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-foreground)_65%,transparent)]">
          {subtitle}
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-copper)]">
          {email} · {phone}
        </p>
        <p className="mt-2 text-sm italic text-[color-mix(in_srgb,var(--color-foreground)_58%,transparent)]">{address}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label className="sr-only" htmlFor="rs-date">
            Preferred date
          </label>
          <input id="rs-date" type="date" name="date" />
          <label className="sr-only" htmlFor="rs-guests">
            Guests
          </label>
          <input id="rs-guests" type="number" name="guests" min={1} max={12} placeholder="Guests" />
          <label className="sr-only" htmlFor="rs-email">
            Email
          </label>
          <input id="rs-email" type="email" name="email" placeholder="Email" />
          <button type="submit" className="rs-btn-primary w-full">
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
