/**
 * Booking vertical: agenda board + sample appointments seed.
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

export function isBookingVerticalScaffold(input: {
  templateId?: string | null;
  dataModels?: AppDataModel[];
}): boolean {
  if ((input.templateId || "").toLowerCase() === "booking") return true;
  const names = modelNames(input.dataModels);
  return names.has("booking") && names.has("service");
}

function buildBookingAgendaPage(bookingModel: AppDataModel): string {
  const model = toPrismaModelName(bookingModel.name);
  const slug = entitySlug(bookingModel.name);
  const apiPath = JSON.stringify(`/api/${slug}`);
  const statusField =
    bookingModel.fields.find((field) => field.name === "status")?.name || "status";
  const startField =
    bookingModel.fields.find((field) => field.name === "startsAt")?.name ||
    "startsAt";
  const statuses =
    bookingModel.fields.find((field) => field.name === statusField)?.enumValues ??
    ["pending", "confirmed", "completed", "cancelled"];

  return `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/lib/i18n";

type RecordRow = Record<string, unknown> & { id: string };

const API_PATH = ${apiPath};
const STATUS_FIELD = ${JSON.stringify(statusField)};
const START_FIELD = ${JSON.stringify(startField)};
const STATUSES: string[] = ${JSON.stringify(statuses)};

export default function ${model}AgendaPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load bookings");
      setRows(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) =>
      String(a[START_FIELD] || "").localeCompare(String(b[START_FIELD] || "")),
    );
  }, [rows]);

  const setStatus = async (id: string, status: string) => {
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
      if (!res.ok) throw new Error(data.error || "Failed to update booking");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update booking");
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Booking agenda</h1>
        <p className="text-sm text-muted-foreground">
          Confirm, complete, or cancel appointments. Seed demo data after ZIP deploy with npm run db:seed.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((row) => (
          <Card key={row.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {String(row[START_FIELD] || row.id)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs capitalize text-muted-foreground">
                {String(row[STATUS_FIELD] || t("common.emptyValue"))}
              </p>
              <div className="flex flex-wrap gap-1">
                {STATUSES.filter((status) => status !== String(row[STATUS_FIELD])).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    className="h-7 px-2 text-[11px] capitalize"
                    onClick={() => void setStatus(row.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("common.emptyValue")}</p>
        ) : null}
      </div>
    </div>
  );
}
`;
}

function buildBookingSeed(dataModels: AppDataModel[]): string {
  const service = findDataModel(dataModels, "Service");
  const customer = findDataModel(dataModels, "Customer");
  const booking = findDataModel(dataModels, "Booking");
  const availability = findDataModel(dataModels, "Availability");
  const serviceD = service ? prismaClientDelegate(toPrismaModelName(service.name)) : null;
  const customerD = customer ? prismaClientDelegate(toPrismaModelName(customer.name)) : null;
  const bookingD = booking ? prismaClientDelegate(toPrismaModelName(booking.name)) : null;
  const availabilityD = availability
    ? prismaClientDelegate(toPrismaModelName(availability.name))
    : null;

  return buildPrismaSeedShell(`  ${serviceD ? `await prisma.${serviceD}.deleteMany();` : ""}
  ${customerD ? `await prisma.${customerD}.deleteMany();` : ""}
  ${bookingD ? `await prisma.${bookingD}.deleteMany();` : ""}
  ${availabilityD ? `await prisma.${availabilityD}.deleteMany();` : ""}

  ${
    serviceD
      ? `const services = await Promise.all([
    prisma.${serviceD}.create({ data: { name: "Haircut", durationMin: 45, price: 40, description: "Classic cut", active: true } }),
    prisma.${serviceD}.create({ data: { name: "Consultation", durationMin: 30, price: 25, description: "Intro call", active: true } }),
  ]);`
      : "const services: Array<{ id: string }> = [];"
  }

  ${
    customerD
      ? `const customers = await Promise.all([
    prisma.${customerD}.create({ data: { name: "Maya Nasser", email: "maya@example.com", phone: "+1-555-0201", notes: "Prefers mornings", preferredLanguage: "en" } }),
    prisma.${customerD}.create({ data: { name: "Karim Saleh", email: "karim@example.com", phone: "+1-555-0202", notes: "", preferredLanguage: "ar" } }),
  ]);`
      : "const customers: Array<{ id: string }> = [];"
  }

  ${
    bookingD
      ? `await Promise.all([
    prisma.${bookingD}.create({ data: { serviceId: services[0]?.id ?? "", customerId: customers[0]?.id ?? "", startsAt: new Date("2026-04-10T09:00:00Z"), status: "confirmed", notes: "Front desk" } }),
    prisma.${bookingD}.create({ data: { serviceId: services[1]?.id ?? "", customerId: customers[1]?.id ?? "", startsAt: new Date("2026-04-10T11:30:00Z"), status: "pending", notes: "" } }),
    prisma.${bookingD}.create({ data: { serviceId: services[0]?.id ?? "", customerId: customers[1]?.id ?? "", startsAt: new Date("2026-04-11T15:00:00Z"), status: "completed", notes: "Follow-up" } }),
  ]);`
      : ""
  }

  ${
    availabilityD
      ? `await Promise.all([
    prisma.${availabilityD}.create({ data: { weekday: 1, startTime: "09:00", endTime: "17:00", capacity: 4, staffName: "Alex" } }),
    prisma.${availabilityD}.create({ data: { weekday: 3, startTime: "10:00", endTime: "18:00", capacity: 3, staffName: "Sam" } }),
  ]);`
      : ""
  }
`);
}

export function applyBookingVerticalScaffold(
  files: GeneratedProjectFile[],
  options: { templateId?: string | null; dataModels?: AppDataModel[] },
): GeneratedProjectFile[] {
  if (!isBookingVerticalScaffold(options)) return files;
  const booking = findDataModel(options.dataModels, "Booking");
  if (!booking) return files;

  let next = upsertFile(files, {
    path: `app/dashboard/${entitySlug(booking.name)}/page.tsx`,
    language: "tsx",
    content: buildBookingAgendaPage(booking),
  });

  return attachPrismaSeed(
    next,
    buildBookingSeed(options.dataModels ?? []),
    [
      "## Booking sample data",
      "",
      "After `npx prisma db push`, load appointments:",
      "",
      "```bash",
      "npm run db:seed",
      "```",
      "",
      "Then open `/dashboard/bookings` for the agenda board.",
    ].join("\n"),
  );
}
