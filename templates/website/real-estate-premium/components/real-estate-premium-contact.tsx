"use client";

type RealEstatePremiumContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function RealEstatePremiumContact({
  eyebrow = "Private inquiry",
  title = "Request a dossier",
  subtitle = "Share preferred markets and timing — the desk replies within one business day.",
  email = "desk@estates.example",
  phone = "+1 (555) 000-0000",
  address = "By appointment — New York · London · Dubai",
  submitLabel = "Submit inquiry",
}: RealEstatePremiumContactProps) {
  return (
    <section id="contact" data-v2-component="real-estate-premium-contact" className="rep-section-plain rep-reveal">
      <div className="rep-contact-sheet">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        <p className="rep-body text-[var(--color-muted)]">{subtitle}</p>
        <dl className="rep-spec-list">
          <div>
            <dt>Desk</dt>
            <dd>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{phone}</dd>
          </div>
          <div>
            <dt>Offices</dt>
            <dd>{address}</dd>
          </div>
        </dl>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label className="sr-only" htmlFor="rep-contact-market">
            Preferred market
          </label>
          <input id="rep-contact-market" type="text" name="market" placeholder="Preferred market or reference" />
          <label className="sr-only" htmlFor="rep-contact-note">
            Note
          </label>
          <textarea id="rep-contact-note" name="note" rows={4} placeholder="Brief, budget band, timing" />
          <button type="submit" className="rep-btn-primary w-full">
            {submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
