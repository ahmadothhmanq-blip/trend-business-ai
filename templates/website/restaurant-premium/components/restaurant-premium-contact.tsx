"use client";

type RestaurantPremiumContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
  ctaLabel?: string;
};

export function RestaurantPremiumContact({
  eyebrow = "Contact",
  title = "Let's start a conversation",
  subtitle = "Tell us about your goals — our team responds within one business day.",
  email,
  phone,
  address,
  submitLabel,
  ctaLabel = "Send message",
}: RestaurantPremiumContactProps) {
  return (
    <section id="contact" data-v2-component="restaurant-premium-contact" aria-labelledby="rp-contact-title" className="rp-reveal rp-section rp-section-alt">
      <div className="rp-shell rp-contact-grid">
        <div className="rp-split-left">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 id="rp-contact-title" className="rp-h2">{title}</h2>
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
          {email || phone || address ? (
            <address className="rp-contact-meta not-italic">
              {address ? <p>{address}</p> : null}
              {email ? (
                <p>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </p>
              ) : null}
            </address>
          ) : null}
        </div>
        <form className="rp-form rp-split-right rp-form-enter" onSubmit={(e) => e.preventDefault()}>
          <div className="rp-form-row">
            <label>
              <span>Full name</span>
              <input type="text" name="name" className="rp-input" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" className="rp-input" />
            </label>
          </div>
          <label>
            <span>How can we help?</span>
            <textarea name="message" rows={5} className="rp-input" />
          </label>
          <button type="submit" className="rp-btn-primary rp-focus-ring">
            {submitLabel || ctaLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
