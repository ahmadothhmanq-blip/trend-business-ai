import type { BillingProviderId } from "@/types/billing";

export type PayPalMode = "sandbox" | "live";

export function getPayPalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "";
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim() ?? "";
  const mode: PayPalMode =
    process.env.PAYPAL_MODE?.trim() === "live" ? "live" : "sandbox";

  return {
    clientId,
    clientSecret,
    webhookId,
    mode,
    configured: Boolean(clientId && clientSecret),
    apiBase:
      mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com",
  };
}

export function getConfiguredBillingProviders(): BillingProviderId[] {
  const paypal = getPayPalConfig();
  if (!paypal.configured) return [];
  // Card checkout is hosted through PayPal's guest/card flow.
  return ["paypal", "card"];
}

export function isBillingConfigured() {
  return getConfiguredBillingProviders().length > 0;
}
