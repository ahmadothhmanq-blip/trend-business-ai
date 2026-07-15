export type BillingProviderId = "paypal" | "card";

export type BillingInterval = "monthly" | "yearly";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "incomplete";

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export type CreditLedgerReason =
  | "purchase"
  | "subscription_grant"
  | "usage"
  | "refund"
  | "adjustment"
  | "bonus";

export type CheckoutPurpose = "subscription" | "credits";

export type BillingSubscription = {
  id: string;
  user_id: string;
  organization_id: string | null;
  plan_id: string;
  billing_interval: BillingInterval;
  status: SubscriptionStatus;
  provider: BillingProviderId;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  amount_cents: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BillingInvoice = {
  id: string;
  user_id: string;
  organization_id: string | null;
  subscription_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  description: string;
  amount_cents: number;
  currency: string;
  provider: BillingProviderId;
  provider_invoice_id: string | null;
  provider_payment_id: string | null;
  hosted_invoice_url: string | null;
  pdf_url: string | null;
  line_items: Array<{ description: string; amount_cents: number; quantity?: number }>;
  paid_at: string | null;
  due_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CreditBalance = {
  user_id: string;
  balance: number;
  lifetime_purchased: number;
  lifetime_used: number;
  updated_at: string;
};

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

export type BillingCheckoutSession = {
  id: string;
  user_id: string;
  purpose: CheckoutPurpose;
  provider: BillingProviderId;
  status: "pending" | "processing" | "completed" | "expired" | "canceled";
  plan_id: string | null;
  billing_interval: BillingInterval | null;
  credit_pack_id: string | null;
  amount_cents: number;
  currency: string;
  provider_order_id: string | null;
  approval_url: string | null;
  metadata: Record<string, unknown>;
  expires_at: string;
  completed_at: string | null;
  created_at: string;
};

export type BillingStatusResponse = {
  currentPlanId: string;
  subscription: BillingSubscription | null;
  credits: CreditBalance;
  invoices: BillingInvoice[];
  creditPacks: CreditPack[];
  providersConfigured: BillingProviderId[];
  billingConfigured: boolean;
};
