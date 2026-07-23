import type { EmailProviderAdapter } from "./providers";

/** SendGrid adapter foundation — requires MARKETING_SENDGRID_API_KEY */
export const SendGridAdapter: EmailProviderAdapter = {
  provider: "sendgrid",
  validateConfig() {
    const key = process.env.MARKETING_SENDGRID_API_KEY?.trim();
    return key ? { valid: true } : { valid: false, error: "MARKETING_SENDGRID_API_KEY not configured" };
  },
  async sendEmail(args) {
    const validation = SendGridAdapter.validateConfig();
    if (!validation.valid) return { ok: false, error: validation.error };

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MARKETING_SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: args.to }] }],
        from: { email: process.env.MARKETING_SENDGRID_FROM_EMAIL ?? "noreply@example.com" },
        subject: args.subject,
        content: [
          { type: "text/plain", value: args.text ?? args.subject },
          { type: "text/html", value: args.html },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err || "SendGrid send failed" };
    }
    return { ok: true, messageId: res.headers.get("x-message-id") ?? undefined };
  },
};

/** Mailchimp adapter foundation — API key or OAuth token */
export const MailchimpAdapter: EmailProviderAdapter = {
  provider: "mailchimp",
  validateConfig() {
    const key = process.env.MARKETING_MAILCHIMP_API_KEY?.trim();
    return key ? { valid: true } : { valid: false, error: "MARKETING_MAILCHIMP_API_KEY not configured" };
  },
  async sendEmail(args) {
    const validation = MailchimpAdapter.validateConfig();
    if (!validation.valid) return { ok: false, error: validation.error };

    const dc = process.env.MARKETING_MAILCHIMP_SERVER_PREFIX ?? "us1";
    const listId = process.env.MARKETING_MAILCHIMP_LIST_ID ?? "";
    if (!listId) return { ok: false, error: "MARKETING_MAILCHIMP_LIST_ID not configured" };

    const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MARKETING_MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "regular",
        recipients: { list_id: listId },
        settings: { subject_line: args.subject, title: args.subject },
      }),
    });

    if (!res.ok) {
      return { ok: false, error: await res.text() };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, messageId: data.id };
  },
};
