import { handleBillingWebhook } from "@/lib/billing";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ provider: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { provider: raw } = await context.params;
  if (raw !== "paypal" && raw !== "card") {
    return NextResponse.json({ error: "Unsupported billing provider." }, { status: 404 });
  }

  const rawBody = await request.text();
  const result = await handleBillingWebhook({
    provider: raw,
    headers: request.headers,
    rawBody,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ received: true, ...result }, { status: result.status });
}
