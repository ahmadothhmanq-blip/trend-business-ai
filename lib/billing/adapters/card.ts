import { paypalAdapter } from "@/lib/billing/adapters/paypal";
import type {
  BillingProviderAdapter,
  CapturePaymentResult,
  CreateCheckoutInput,
  CreateCheckoutResult,
  WebhookEvent,
} from "@/lib/billing/adapters/types";

/**
 * Visa / Mastercard checkout via PayPal's hosted card/guest billing flow.
 * Keeps PCI scope off our servers while exposing a distinct "card" provider
 * in the billing layer for future dedicated card gateways.
 */
export class CardAdapter implements BillingProviderAdapter {
  readonly id = "card" as const;

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    return paypalAdapter.createCheckout({ ...input, preferCard: true });
  }

  async capturePayment(providerSessionId: string): Promise<CapturePaymentResult> {
    return paypalAdapter.capturePayment(providerSessionId);
  }

  async verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
    return paypalAdapter.verifyWebhook?.(headers, rawBody) ?? false;
  }

  parseWebhook(payload: unknown): WebhookEvent | null {
    return paypalAdapter.parseWebhook?.(payload) ?? null;
  }
}

export const cardAdapter = new CardAdapter();
