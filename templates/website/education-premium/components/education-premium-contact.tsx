"use client";

type EducationPremiumContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function EducationPremiumContact({
  eyebrow = "Correspondence",
  title = "Letters desk",
  subtitle = "Address the editors, admissions, or campus visits. We answer in kind — thoughtfully, and within a business day.",
  email = "letters@heritage.edu",
  phone = "+1 (555) 184-6000",
  address = "Heritage Hall · Admissions Corridor",
  submitLabel = "Post letter",
}: EducationPremiumContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="education-premium-contact"
      aria-labelledby="ed-contact-title"
      className="ed-letters ed-paper ed-reveal"
    >
      <div className="ed-letters-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-contact-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>

        <div className="ed-letters-layout">
          <aside className="ed-letters-meta">
            <p>
              <span className="ed-letters-label">Post</span>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p>
              <span className="ed-letters-label">Wire</span>
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            </p>
            <p>
              <span className="ed-letters-label">Desk</span>
              <span>{address}</span>
            </p>
          </aside>

          <form className="ed-letters-form" onSubmit={(e) => e.preventDefault()}>
            <div className="ed-letters-grid">
              <label className="ed-letters-field">
                <span>Correspondent</span>
                <input type="text" name="name" autoComplete="name" className="ed-input" required />
              </label>
              <label className="ed-letters-field">
                <span>Return address</span>
                <input type="email" name="email" autoComplete="email" className="ed-input" required />
              </label>
            </div>
            <label className="ed-letters-field">
              <span>Subject</span>
              <input type="text" name="subject" className="ed-input" />
            </label>
            <label className="ed-letters-field">
              <span>Letter</span>
              <textarea name="message" rows={6} className="ed-textarea" required />
            </label>
            <button type="submit" className="ed-btn-primary ed-focus-ring">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
