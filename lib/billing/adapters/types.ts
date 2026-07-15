import type { BillingInterval, BillingProviderId, CheckoutPurpose } from "@/types/billing";

export type CreateCheckoutInput = {
  purpose: CheckoutPurpose;
  amountCents: number;
  currency: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customId: string;
  billingInterval?: BillingInterval;
  /** Prefer card landing page when provider is card */
  preferCard?: boolean;
};

export type CreateCheckoutResult = {
  providerSessionId: string;
  approvalUrl: string;
  raw?: unknown;
};

export type CapturePaymentResult = {
  providerPaymentId: string;
  status: "COMPLETED" | "APPROVED" | "PENDING" | "FAILED";
  amountCents: number;
  currency: string;
  payerEmail?: string;
  raw?: unknown;
};

export type WebhookEvent = {
  eventId: string;
  eventType: string;
  providerSessionId?: string;
  providerPaymentId?: string;
  customId?: string;
  status?: string;
  raw: unknown;
};

export interface BillingProviderAdapter {
  readonly id: BillingProviderId;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  capturePayment(providerSessionId: string): Promise<CapturePaymentResult>;
  cancelSubscription?(providerSubscriptionId: string): Promise<void>;
  verifyWebhook?(headers: Headers, rawBody: string): Promise<boolean>;
  parseWebhook?(payload: unknown): WebhookEvent | null;
}
