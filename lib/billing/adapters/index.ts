import { cardAdapter } from "@/lib/billing/adapters/card";
import { paypalAdapter } from "@/lib/billing/adapters/paypal";
import type { BillingProviderAdapter } from "@/lib/billing/adapters/types";
import { getConfiguredBillingProviders } from "@/lib/billing/config";
import type { BillingProviderId } from "@/types/billing";

const adapters: Record<BillingProviderId, BillingProviderAdapter> = {
  paypal: paypalAdapter,
  card: cardAdapter,
};

export function getBillingAdapter(provider: BillingProviderId): BillingProviderAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unknown billing provider: ${provider}`);
  }
  if (!getConfiguredBillingProviders().includes(provider)) {
    throw new Error(`Billing provider "${provider}" is not configured.`);
  }
  return adapter;
}

export function listBillingAdapters(): BillingProviderAdapter[] {
  return getConfiguredBillingProviders().map((id) => adapters[id]);
}

export type { BillingProviderAdapter, CreateCheckoutInput, CreateCheckoutResult, CapturePaymentResult, WebhookEvent } from "@/lib/billing/adapters/types";
