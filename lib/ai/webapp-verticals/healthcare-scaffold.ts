/**
 * Healthcare vertical: clinic appointments board + patient seed.
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

export function isHealthcareVerticalScaffold(input: {
  templateId?: string | null;
  dataModels?: AppDataModel[];
}): boolean {
  if ((input.templateId || "").toLowerCase() === "healthcare") return true;
  const names = modelNames(input.dataModels);
  return names.has("patient") && names.has("appointment");
}

function buildClinicBoardPage(appointmentModel: AppDataModel): string {
  const model = toPrismaModelName(appointmentModel.name);
  const slug = entitySlug(appointmentModel.name);
  const apiPath = JSON.stringify(`/api/${slug}`);
  const statusField =
    appointmentModel.fields.find((field) => field.name === "status")?.name ||
    "status";
  const startField =
    appointmentModel.fields.find((field) => field.name === "startsAt")?.name ||
    "startsAt";
  const reasonField =
    appointmentModel.fields.find((field) => field.name === "reason")?.name ||
    "reason";
  const statuses =
    appointmentModel.fields.find((field) => field.name === statusField)
      ?.enumValues ?? ["scheduled", "checked-in", "completed", "cancelled"];

  return `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/lib/i18n";

type RecordRow = Record<string, unknown> & { id: string };

const API_PATH = ${apiPath};
const STATUS_FIELD = ${JSON.stringify(statusField)};
const START_FIELD = ${JSON.stringify(startField)};
const REASON_FIELD = ${JSON.stringify(reasonField)};
const STATUSES: string[] = ${JSON.stringify(statuses)};

export default function ${model}ClinicBoardPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load appointments");
      setRows(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load appointments");
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
      const status = String(row[STATUS_FIELD] || STATUSES[0] || "scheduled");
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
      if (!res.ok) throw new Error(data.error || "Failed to update appointment");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update appointment");
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clinic board</h1>
        <p className="text-sm text-muted-foreground">
          Check patients in and complete visits. Records stay on your self-hosted ZIP app.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((status) => (
          <Card key={status} className="min-h-[240px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between text-sm capitalize">
                <span>{status.replace("-", " ")}</span>
                <span className="text-muted-foreground">{byStatus[status]?.length ?? 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(byStatus[status] ?? []).map((row) => (
                <div key={row.id} className="rounded-lg border bg-background p-3">
                  <div className="text-sm font-medium">{String(row[START_FIELD] ?? row.id)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {String(row[REASON_FIELD] || t("common.emptyValue"))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {STATUSES.filter((s) => s !== status).map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        className="h-7 px-2 text-[11px] capitalize"
                        onClick={() => void move(row.id, nextStatus)}
                      >
                        {nextStatus.replace("-", " ")}
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

function buildHealthcareSeed(dataModels: AppDataModel[]): string {
  const patient = findDataModel(dataModels, "Patient");
  const appointment = findDataModel(dataModels, "Appointment");
  const record = findDataModel(dataModels, "Record");
  const staff = findDataModel(dataModels, "Staff");
  const patientD = patient ? prismaClientDelegate(toPrismaModelName(patient.name)) : null;
  const appointmentD = appointment
    ? prismaClientDelegate(toPrismaModelName(appointment.name))
    : null;
  const recordD = record ? prismaClientDelegate(toPrismaModelName(record.name)) : null;
  const staffD = staff ? prismaClientDelegate(toPrismaModelName(staff.name)) : null;

  return buildPrismaSeedShell(`  ${patientD ? `await prisma.${patientD}.deleteMany();` : ""}
  ${appointmentD ? `await prisma.${appointmentD}.deleteMany();` : ""}
  ${recordD ? `await prisma.${recordD}.deleteMany();` : ""}
  ${staffD ? `await prisma.${staffD}.deleteMany();` : ""}

  ${
    patientD
      ? `const patients = await Promise.all([
    prisma.${patientD}.create({ data: { name: "Hana Youssef", email: "hana@example.com", dob: new Date("1992-05-12"), phone: "+1-555-0301", bloodType: "O+" } }),
    prisma.${patientD}.create({ data: { name: "Rami Khouri", email: "rami@example.com", dob: new Date("1986-11-03"), phone: "+1-555-0302", bloodType: "A-" } }),
  ]);`
      : "const patients: Array<{ id: string }> = [];"
  }

  ${
    appointmentD
      ? `await Promise.all([
    prisma.${appointmentD}.create({ data: { patientId: patients[0]?.id ?? "", startsAt: new Date("2026-04-10T08:30:00Z"), reason: "Annual checkup", status: "scheduled", providerName: "Dr. Adams" } }),
    prisma.${appointmentD}.create({ data: { patientId: patients[1]?.id ?? "", startsAt: new Date("2026-04-10T09:15:00Z"), reason: "Follow-up", status: "checked-in", providerName: "Dr. Adams" } }),
    prisma.${appointmentD}.create({ data: { patientId: patients[0]?.id ?? "", startsAt: new Date("2026-04-09T14:00:00Z"), reason: "Labs review", status: "completed", providerName: "Dr. Chen" } }),
  ]);`
      : ""
  }

  ${
    recordD
      ? `await Promise.all([
    prisma.${recordD}.create({ data: { patientId: patients[0]?.id ?? "", title: "Intake notes", notes: "No known allergies", createdAt: new Date("2026-04-01"), confidential: true } }),
    prisma.${recordD}.create({ data: { patientId: patients[1]?.id ?? "", title: "Vitals", notes: "BP normal", createdAt: new Date("2026-04-09"), confidential: true } }),
  ]);`
      : ""
  }

  ${
    staffD
      ? `await Promise.all([
    prisma.${staffD}.create({ data: { name: "Dr. Adams", email: "adams@clinic.example", role: "employee", specialty: "General", active: true } }),
    prisma.${staffD}.create({ data: { name: "Clinic Admin", email: "admin@clinic.example", role: "admin", specialty: "Ops", active: true } }),
  ]);`
      : ""
  }
`);
}

export function applyHealthcareVerticalScaffold(
  files: GeneratedProjectFile[],
  options: { templateId?: string | null; dataModels?: AppDataModel[] },
): GeneratedProjectFile[] {
  if (!isHealthcareVerticalScaffold(options)) return files;
  const appointment = findDataModel(options.dataModels, "Appointment");
  if (!appointment) return files;

  const next = upsertFile(files, {
    path: `app/dashboard/${entitySlug(appointment.name)}/page.tsx`,
    language: "tsx",
    content: buildClinicBoardPage(appointment),
  });

  return attachPrismaSeed(
    next,
    buildHealthcareSeed(options.dataModels ?? []),
    [
      "## Clinic sample data",
      "",
      "After `npx prisma db push`, load patients and appointments:",
      "",
      "```bash",
      "npm run db:seed",
      "```",
      "",
      "Then open `/dashboard/appointments` for the clinic board.",
    ].join("\n"),
  );
}
