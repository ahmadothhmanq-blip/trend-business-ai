import { getPayPalConfig } from "@/lib/billing/config";
import type {
  BillingProviderAdapter,
  CapturePaymentResult,
  CreateCheckoutInput,
  CreateCheckoutResult,
  WebhookEvent,
} from "@/lib/billing/adapters/types";
import { logger } from "@/lib/logger";

type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const config = getPayPalConfig();
  if (!config.configured) {
    throw new Error("PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
  }

  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const res = await fetch(`${config.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    logger.error("PayPal OAuth failed", "billing.paypal", { status: res.status });
    throw new Error("Failed to authenticate with PayPal.");
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function paypalFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getPayPalConfig();
  const token = await getAccessToken();
  const res = await fetch(`${config.apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error("PayPal API error", "billing.paypal", { path, status: res.status, bodyLength: text.length });
    throw new Error(`PayPal request failed (${res.status}).`);
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

type PayPalLink = { href: string; rel: string; method?: string };
type PayPalOrder = {
  id: string;
  status: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{ id: string; status: string; amount?: { value?: string; currency_code?: string } }>;
    };
  }>;
  payer?: { email_address?: string };
};

function amountFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

function centsFromAmount(value: string | undefined) {
  if (!value) return 0;
  return Math.round(Number(value) * 100);
}

function findApprovalUrl(links: PayPalLink[] | undefined) {
  const approve = links?.find((l) => l.rel === "approve" || l.rel === "payer-action");
  if (!approve?.href) throw new Error("PayPal did not return an approval URL.");
  return approve.href;
}

function buildOrderPayload(input: CreateCheckoutInput, preferCard: boolean) {
  return {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: input.customId,
        description: input.description.slice(0, 127),
        amount: {
          currency_code: input.currency.toUpperCase(),
          value: amountFromCents(input.amountCents),
        },
      },
    ],
    application_context: {
      brand_name: "Trend Business AI",
      landing_page: preferCard ? "BILLING" : "LOGIN",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
      return_url: input.successUrl,
      cancel_url: input.cancelUrl,
    },
  };
}

export class PayPalAdapter implements BillingProviderAdapter {
  readonly id = "paypal" as const;

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const order = await paypalFetch<PayPalOrder>("/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify(buildOrderPayload(input, Boolean(input.preferCard))),
    });

    return {
      providerSessionId: order.id,
      approvalUrl: findApprovalUrl(order.links),
      raw: order,
    };
  }

  async capturePayment(providerSessionId: string): Promise<CapturePaymentResult> {
    const existing = await paypalFetch<PayPalOrder>(`/v2/checkout/orders/${providerSessionId}`);
    const existingCapture = existing.purchase_units?.[0]?.payments?.captures?.[0];
    if (existing.status === "COMPLETED" || existingCapture?.status === "COMPLETED") {
      return {
        providerPaymentId: existingCapture?.id ?? existing.id,
        status: "COMPLETED",
        amountCents: centsFromAmount(
          existingCapture?.amount?.value ?? existing.purchase_units?.[0]?.amount?.value,
        ),
        currency: (
          existingCapture?.amount?.currency_code ??
          existing.purchase_units?.[0]?.amount?.currency_code ??
          "USD"
        ).toUpperCase(),
        payerEmail: existing.payer?.email_address,
        raw: existing,
      };
    }

    const order = await paypalFetch<PayPalOrder>(`/v2/checkout/orders/${providerSessionId}/capture`, {
      method: "POST",
      body: "{}",
    });

    const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
    const status =
      capture?.status === "COMPLETED" || order.status === "COMPLETED"
        ? "COMPLETED"
        : order.status === "APPROVED"
          ? "APPROVED"
          : order.status === "PENDING"
            ? "PENDING"
            : "FAILED";

    return {
      providerPaymentId: capture?.id ?? order.id,
      status,
      amountCents: centsFromAmount(capture?.amount?.value ?? order.purchase_units?.[0]?.amount?.value),
      currency: (capture?.amount?.currency_code ?? order.purchase_units?.[0]?.amount?.currency_code ?? "USD").toUpperCase(),
      payerEmail: order.payer?.email_address,
      raw: order,
    };
  }

  async verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
    const config = getPayPalConfig();
    if (!config.webhookId) {
      logger.warn("PAYPAL_WEBHOOK_ID unset — rejecting webhook", "billing.paypal");
      // Never accept unverified webhooks when billing credentials exist.
      return process.env.ALLOW_INSECURE_PAYPAL_WEBHOOKS === "true" && process.env.NODE_ENV !== "production";
    }

    const transmissionId = headers.get("paypal-transmission-id");
    const transmissionTime = headers.get("paypal-transmission-time");
    const certUrl = headers.get("paypal-cert-url");
    const authAlgo = headers.get("paypal-auth-algo");
    const transmissionSig = headers.get("paypal-transmission-sig");

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return false;
    }

    try {
      const certHost = new URL(certUrl).hostname.toLowerCase();
      if (!certHost.endsWith(".paypal.com") && !certHost.endsWith(".paypalobjects.com")) {
        logger.warn("Rejected PayPal cert_url host", "billing.paypal", { certHost });
        return false;
      }

      const result = await paypalFetch<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
        method: "POST",
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: config.webhookId,
          webhook_event: JSON.parse(rawBody),
        }),
      });
      return result.verification_status === "SUCCESS";
    } catch (error) {
      logger.error("PayPal webhook verification failed", "billing.paypal", undefined, error);
      return false;
    }
  }

  parseWebhook(payload: unknown): WebhookEvent | null {
    if (!payload || typeof payload !== "object") return null;
    const event = payload as {
      id?: string;
      event_type?: string;
      resource?: {
        id?: string;
        status?: string;
        custom_id?: string;
        purchase_units?: Array<{ custom_id?: string; payments?: { captures?: Array<{ id?: string }> } }>;
        supplementary_data?: { related_ids?: { order_id?: string } };
      };
    };

    if (!event.id || !event.event_type) return null;

    const resource = event.resource ?? {};
    const providerSessionId =
      resource.supplementary_data?.related_ids?.order_id ??
      (event.event_type.startsWith("CHECKOUT.ORDER") ? resource.id : undefined);
    const providerPaymentId =
      resource.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
      (event.event_type.includes("PAYMENT.CAPTURE") ? resource.id : undefined);

    return {
      eventId: event.id,
      eventType: event.event_type,
      providerSessionId,
      providerPaymentId,
      customId: resource.custom_id ?? resource.purchase_units?.[0]?.custom_id,
      status: resource.status,
      raw: payload,
    };
  }
}

export const paypalAdapter = new PayPalAdapter();
