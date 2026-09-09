/**
 * Ecommerce vertical: order fulfillment board + catalog seed.
 */

import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { entitySlug } from "@/lib/ai/webapp-requirements";
import {
  prismaClientDelegate,
  toPrismaModelName,
} from "@/lib/ai/webapp-domain-scaffold";
import {
  attachPrismaSeed,
  buildPrismaSeedShell,
  findDataModel,
  modelNames,
  upsertFile,
} from "@/lib/ai/webapp-verticals/shared";

export function isEcommerceVerticalScaffold(input: {
  templateId?: string | null;
  dataModels?: AppDataModel[];
}): boolean {
  const id = (input.templateId || "").toLowerCase();
  if (id === "ecommerce" || id === "ecommerce-admin") return true;
  const names = modelNames(input.dataModels);
  return names.has("product") && names.has("order");
}

function buildOrdersFulfillmentPage(orderModel: AppDataModel): string {
  const model = toPrismaModelName(orderModel.name);
  const slug = entitySlug(orderModel.name);
  const apiPath = JSON.stringify(`/api/${slug}`);
  const statusField =
    orderModel.fields.find((field) => field.name === "status")?.name || "status";
  const statuses =
    orderModel.fields.find((field) => field.name === statusField)?.enumValues ??
    ["pending", "paid", "shipped", "delivered", "cancelled"];
  const emailField =
    orderModel.fields.find((field) => field.name === "customerEmail")?.name ||
    "customerEmail";
  const totalField =
    orderModel.fields.find((field) => field.name === "total")?.name || "total";

  return `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/lib/i18n";

type RecordRow = Record<string, unknown> & { id: string };

const API_PATH = ${apiPath};
const STATUS_FIELD = ${JSON.stringify(statusField)};
const EMAIL_FIELD = ${JSON.stringify(emailField)};
const TOTAL_FIELD = ${JSON.stringify(totalField)};
const STATUSES: string[] = ${JSON.stringify(statuses)};

function money(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return t("common.emptyValue");
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function ${model}FulfillmentPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setRows(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byStatus = useMemo(() => {
    const map: Record<string, RecordRow[]> = {};
    for (const status of STATUSES) map[status] = [];
    for (const row of rows) {
      const status = String(row[STATUS_FIELD] || STATUSES[0] || "pending");
      if (!map[status]) map[status] = [];
      map[status].push(row);
    }
    return map;
  }, [rows]);

  const move = async (id: string, status: string) => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [STATUS_FIELD]: status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update order");
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Order fulfillment</h1>
        <p className="text-sm text-muted-foreground">
          Move paid orders through shipping. Production storefront runs from your ZIP host.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {STATUSES.map((status) => (
          <Card key={status} className="min-h-[240px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between text-sm capitalize">
                <span>{status}</span>
                <span className="text-muted-foreground">{byStatus[status]?.length ?? 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(byStatus[status] ?? []).map((row) => (
                <div key={row.id} className="rounded-lg border bg-background p-3">
                  <div className="text-sm font-medium">{String(row[EMAIL_FIELD] ?? row.id)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{money(row[TOTAL_FIELD])}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {STATUSES.filter((s) => s !== status).slice(0, 3).map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        className="h-7 px-2 text-[11px] capitalize"
                        onClick={() => void move(row.id, nextStatus)}
                      >
                        {nextStatus}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`;
}

function buildEcommerceSeed(dataModels: AppDataModel[]): string {
  const product = findDataModel(dataModels, "Product");
  const order = findDataModel(dataModels, "Order");
  const review = findDataModel(dataModels, "Review");
  const productD = product ? prismaClientDelegate(toPrismaModelName(product.name)) : null;
  const orderD = order ? prismaClientDelegate(toPrismaModelName(order.name)) : null;
  const reviewD = review ? prismaClientDelegate(toPrismaModelName(review.name)) : null;

  return buildPrismaSeedShell(`  ${productD ? `await prisma.${productD}.deleteMany();` : ""}
  ${orderD ? `await prisma.${orderD}.deleteMany();` : ""}
  ${reviewD ? `await prisma.${reviewD}.deleteMany();` : ""}

  ${
    productD
      ? `const products = await Promise.all([
    prisma.${productD}.create({ data: { title: "Studio Desk Lamp", description: "Adjustable LED lamp", price: 79, stock: 42, imageUrl: "", category: "Home" } }),
    prisma.${productD}.create({ data: { title: "Canvas Tote", description: "Everyday tote", price: 28, stock: 120, imageUrl: "", category: "Accessories" } }),
    prisma.${productD}.create({ data: { title: "Noise-cancel buds", description: "Wireless earbuds", price: 149, stock: 18, imageUrl: "", category: "Audio" } }),
  ]);`
      : "const products: Array<{ id: string }> = [];"
  }

  ${
    orderD
      ? `await Promise.all([
    prisma.${orderD}.create({ data: { customerEmail: "buyer@example.com", status: "paid", total: 107, shippingAddress: "12 Market St", placedAt: new Date("2026-04-01") } }),
    prisma.${orderD}.create({ data: { customerEmail: "ops@example.com", status: "shipped", total: 149, shippingAddress: "88 Harbor Rd", placedAt: new Date("2026-04-02") } }),
    prisma.${orderD}.create({ data: { customerEmail: "vip@example.com", status: "pending", total: 28, shippingAddress: "5 Grove Ave", placedAt: new Date("2026-04-03") } }),
  ]);`
      : ""
  }

  ${
    reviewD
      ? `await Promise.all([
    prisma.${reviewD}.create({ data: { productId: products[0]?.id ?? "", rating: 5, comment: "Bright and sturdy", authorName: "Leila", published: true } }),
    prisma.${reviewD}.create({ data: { productId: products[2]?.id ?? "", rating: 4, comment: "Great battery", authorName: "Noah", published: true } }),
  ]);`
      : ""
  }
`);
}

export function applyEcommerceVerticalScaffold(
  files: GeneratedProjectFile[],
  options: { templateId?: string | null; dataModels?: AppDataModel[] },
): GeneratedProjectFile[] {
  if (!isEcommerceVerticalScaffold(options)) return files;
  const order = findDataModel(options.dataModels, "Order");
  if (!order) return files;

  const next = upsertFile(files, {
    path: `app/dashboard/${entitySlug(order.name)}/page.tsx`,
    language: "tsx",
    content: buildOrdersFulfillmentPage(order),
  });

  return attachPrismaSeed(
    next,
    buildEcommerceSeed(options.dataModels ?? []),
    [
      "## Store sample data",
      "",
      "After `npx prisma db push`, load catalog and orders:",
      "",
      "```bash",
      "npm run db:seed",
      "```",
      "",
      "Then open `/dashboard/orders` for fulfillment columns.",
    ].join("\n"),
  );
}
