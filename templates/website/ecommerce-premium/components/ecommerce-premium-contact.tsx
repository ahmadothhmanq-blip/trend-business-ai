"use client";

type EcommercePremiumContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function EcommercePremiumContact({
  eyebrow = "Concierge",
  title = "Private desk",
  subtitle = "Reservations, fittings, and collection inquiries.",
  email = "desk@atelier.example",
  phone = "+1 (555) 420-1800",
  address = "Atelier showroom · by appointment",
  submitLabel = "Send inquiry",
}: EcommercePremiumContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="ecommerce-premium-contact"
      aria-labelledby="ec-contact-title"
      className="ec-contact ec-reveal"
    >
      <div className="ec-contact-inner">
        <header className="ec-section-head">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-contact-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </header>
        <div className="ec-contact-layout">
          <aside className="ec-contact-meta">
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p>
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            </p>
            <p>{address}</p>
          </aside>
          <form className="ec-contact-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span>Name</span>
              <input type="text" name="name" className="ec-input" required autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" className="ec-input" required autoComplete="email" />
            </label>
            <label>
              <span>Interest</span>
              <textarea name="message" rows={4} className="ec-textarea" required />
            </label>
            <button type="submit" className="ec-btn-primary ec-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
