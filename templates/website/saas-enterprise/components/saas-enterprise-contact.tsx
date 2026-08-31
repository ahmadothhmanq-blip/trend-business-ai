"use client";

type SaasEnterpriseContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function SaasEnterpriseContact({
  eyebrow = "Support",
  title = "Open a workspace ticket",
  subtitle = "Sales, security, or onboarding — routed to the right queue.",
  email = "hello@nexus.example",
  phone = "+1 (555) 014-2000",
  address = "Support hours · 24/5 enterprise",
  submitLabel = "Submit ticket",
}: SaasEnterpriseContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="saas-enterprise-contact"
      aria-labelledby="se-contact-title"
      className="se-support se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-contact-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>
        <div className="se-support-layout">
          <aside className="se-support-meta">
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
            {address ? <p>{address}</p> : null}
          </aside>
          <form className="se-support-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              <span>Name</span>
              <input type="text" name="name" className="se-input" required autoComplete="name" />
            </label>
            <label>
              <span>Work email</span>
              <input type="email" name="email" className="se-input" required autoComplete="email" />
            </label>
            <label>
              <span>Queue</span>
              <select name="queue" className="se-input" defaultValue="sales">
                <option value="sales">Sales</option>
                <option value="security">Security</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </label>
            <label>
              <span>Details</span>
              <textarea name="message" rows={4} className="se-textarea" required />
            </label>
            <button type="submit" className="se-btn-primary se-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
