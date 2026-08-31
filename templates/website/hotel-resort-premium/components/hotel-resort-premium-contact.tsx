"use client";

type HotelResortPremiumContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
  ctaLabel?: string;
};

export function HotelResortPremiumContact({
  eyebrow = "Contact",
  title = "Let's start a conversation",
  subtitle = "Tell us about your goals — our team responds within one business day.",
  email,
  phone,
  address,
  submitLabel,
  ctaLabel = "Get started",
}: HotelResortPremiumContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="hotel-resort-premium-contact"
      aria-labelledby="hr-contact-title"
      className="hr-reveal hr-section"
    >
      <div className="df-reveal-stagger hr-container grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="hr-panel hr-split-left p-8 sm:p-10">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 id="hr-contact-title" className="hr-headline-sm mt-4">
            {title}
          </h2>
          <div className="hr-azure-rule my-5" />
          {subtitle ? <p className="hr-body">{subtitle}</p> : null}
          {email || phone || address ? (
            <address className="hr-body-sm mt-8 space-y-3 not-italic">
              {address ? <p>{address}</p> : null}
              {email ? (
                <p>
                  <a href={`mailto:${email}`} className="hr-link">
                    {email}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hr-link">
                    {phone}
                  </a>
                </p>
              ) : null}
            </address>
          ) : null}
        </div>
        <form className="hr-form-panel hr-form-enter space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Full name" aria-label="Full name" className="hr-input" />
            <input type="email" placeholder="Email" aria-label="Email" className="hr-input" />
          </div>
          <textarea placeholder="How can we help?" aria-label="Message" rows={5} className="hr-textarea" />
          <button type="submit" className="hr-btn-primary hr-focus-ring">
            {submitLabel || ctaLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
