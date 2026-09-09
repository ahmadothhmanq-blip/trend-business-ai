/**
 * CRM vertical specialization for App Builder ZIP scaffolds.
 * Generic CRUD remains the base; CRM overlays a pipeline board + seed pack.
 */

import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { entitySlug } from "@/lib/ai/webapp-requirements";
import {
  prismaClientDelegate,
  toPrismaModelName,
} from "@/lib/ai/webapp-domain-scaffold";

export function isCrmVerticalScaffold(input: {
  templateId?: string | null;
  dataModels?: AppDataModel[];
}): boolean {
  if ((input.templateId || "").toLowerCase() === "crm") return true;
  const names = new Set(
    (input.dataModels ?? []).map((model) => model.name.trim().toLowerCase()),
  );
  return names.has("deal") && (names.has("contact") || names.has("company"));
}

function findModel(
  dataModels: AppDataModel[] | undefined,
  name: string,
): AppDataModel | undefined {
  return (dataModels ?? []).find(
    (model) => model.name.trim().toLowerCase() === name.toLowerCase(),
  );
}

function buildCrmPipelinePage(dealModel: AppDataModel): string {
  const model = toPrismaModelName(dealModel.name);
  const slug = entitySlug(dealModel.name);
  const apiPath = JSON.stringify(`/api/${slug}`);
  const stageField =
    dealModel.fields.find((field) => field.name === "stage") ||
    dealModel.fields.find((field) => field.type === "enum");
  const stages =
    stageField?.enumValues?.filter(Boolean) ??
    ["lead", "qualified", "proposal", "won", "lost"];
  const stagesLiteral = JSON.stringify(stages);
  const titleField =
    dealModel.fields.find((field) => field.name === "title")?.name ||
    dealModel.fields.find((field) => field.name === "name")?.name ||
    "title";
  const valueField =
    dealModel.fields.find((field) => field.name === "value")?.name || null;

  return `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/lib/i18n";

type RecordRow = Record<string, unknown> & { id: string };

const API_PATH = ${apiPath};
const STAGES: string[] = ${stagesLiteral};
const TITLE_FIELD = ${JSON.stringify(titleField)};
const VALUE_FIELD = ${JSON.stringify(valueField)};
const STAGE_FIELD = ${JSON.stringify(stageField?.name || "stage")};

function formatMoney(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return t("common.emptyValue");
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ${model}PipelinePage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load deals");
      setRows(Array.isArray(data.data) ? data.data : Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deals");
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byStage = useMemo(() => {
    const map: Record<string, RecordRow[]> = {};
    for (const stage of STAGES) map[stage] = [];
    for (const row of rows) {
      const stage = String(row[STAGE_FIELD] || STAGES[0] || "lead");
      if (!map[stage]) map[stage] = [];
      map[stage].push(row);
    }
    return map;
  }, [rows]);

  const move = async (id: string, stage: string) => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [STAGE_FIELD]: stage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update stage");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update stage");
      setPending(false);
    }
  };

  const pipelineValue = rows.reduce((sum, row) => {
    if (!VALUE_FIELD) return sum;
    const n = Number(row[VALUE_FIELD]);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deal pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Move opportunities across stages. Production data lives in your database after ZIP deploy.
          </p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-2 text-sm">
          <div className="text-muted-foreground">Open pipeline</div>
          <div className="text-lg font-semibold">{formatMoney(pipelineValue)}</div>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {STAGES.map((stage) => (
          <Card key={stage} className="min-h-[280px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm capitalize">
                <span>{stage}</span>
                <span className="text-muted-foreground">{byStage[stage]?.length ?? 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(byStage[stage] ?? []).map((row) => (
                <div key={row.id} className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="text-sm font-medium">
                    {String(row[TITLE_FIELD] ?? row.id)}
                  </div>
                  {VALUE_FIELD ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatMoney(row[VALUE_FIELD])}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {STAGES.filter((s) => s !== stage).map((nextStage) => (
                      <Button
                        key={nextStage}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        className="h-7 px-2 text-[11px] capitalize"
                        onClick={() => void move(row.id, nextStage)}
                      >
                        {nextStage}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {(byStage[stage] ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("common.emptyValue")}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`;
}

function buildCrmSeedFile(dataModels: AppDataModel[]): string {
  const contact = findModel(dataModels, "Contact");
  const company = findModel(dataModels, "Company");
  const deal = findModel(dataModels, "Deal");
  const activity = findModel(dataModels, "Activity");

  const companyDelegate = company
    ? prismaClientDelegate(toPrismaModelName(company.name))
    : null;
  const contactDelegate = contact
    ? prismaClientDelegate(toPrismaModelName(contact.name))
    : null;
  const dealDelegate = deal
    ? prismaClientDelegate(toPrismaModelName(deal.name))
    : null;
  const activityDelegate = activity
    ? prismaClientDelegate(toPrismaModelName(activity.name))
    : null;

  return `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  ${companyDelegate ? `await prisma.${companyDelegate}.deleteMany();` : ""}
  ${contactDelegate ? `await prisma.${contactDelegate}.deleteMany();` : ""}
  ${dealDelegate ? `await prisma.${dealDelegate}.deleteMany();` : ""}
  ${activityDelegate ? `await prisma.${activityDelegate}.deleteMany();` : ""}

  ${
    companyDelegate
      ? `const companies = await Promise.all([
    prisma.${companyDelegate}.create({ data: { name: "Northwind Labs", industry: "SaaS", website: "https://northwind.example", size: "51-200" } }),
    prisma.${companyDelegate}.create({ data: { name: "Cedar Retail", industry: "Retail", website: "https://cedar.example", size: "11-50" } }),
    prisma.${companyDelegate}.create({ data: { name: "Atlas Clinics", industry: "Healthcare", website: "https://atlas.example", size: "201-500" } }),
  ]);`
      : "const companies: Array<{ id: string }> = [];"
  }

  ${
    contactDelegate
      ? `const contacts = await Promise.all([
    prisma.${contactDelegate}.create({ data: { name: "Sara Alami", email: "sara@northwind.example", phone: "+1-555-0101", companyId: companies[0]?.id ?? "" } }),
    prisma.${contactDelegate}.create({ data: { name: "Omar Haddad", email: "omar@cedar.example", phone: "+1-555-0102", companyId: companies[1]?.id ?? "" } }),
    prisma.${contactDelegate}.create({ data: { name: "Lina Faris", email: "lina@atlas.example", phone: "+1-555-0103", companyId: companies[2]?.id ?? "" } }),
  ]);`
      : "const contacts: Array<{ id: string }> = [];"
  }

  ${
    dealDelegate
      ? `await Promise.all([
    prisma.${dealDelegate}.create({ data: { title: "Enterprise seats", value: 48000, stage: "qualified", contactId: contacts[0]?.id ?? "" } }),
    prisma.${dealDelegate}.create({ data: { title: "POS rollout", value: 22000, stage: "proposal", contactId: contacts[1]?.id ?? "" } }),
    prisma.${dealDelegate}.create({ data: { title: "Clinic CRM", value: 61000, stage: "lead", contactId: contacts[2]?.id ?? "" } }),
    prisma.${dealDelegate}.create({ data: { title: "Renewal — Northwind", value: 18000, stage: "won", contactId: contacts[0]?.id ?? "" } }),
  ]);`
      : ""
  }

  ${
    activityDelegate
      ? `await Promise.all([
    prisma.${activityDelegate}.create({ data: { type: "call", subject: "Discovery with Sara", dueAt: new Date("2026-04-02"), done: false } }),
    prisma.${activityDelegate}.create({ data: { type: "meeting", subject: "Proposal walkthrough", dueAt: new Date("2026-04-05"), done: false } }),
    prisma.${activityDelegate}.create({ data: { type: "email", subject: "Send case study", dueAt: new Date("2026-04-01"), done: true } }),
  ]);`
      : ""
  }

  console.log("CRM sample data seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
}

/** Append CRM-specific files / replace deals dashboard with pipeline board. */
export function applyCrmVerticalScaffold(
  files: GeneratedProjectFile[],
  options: { templateId?: string | null; dataModels?: AppDataModel[] },
): GeneratedProjectFile[] {
  if (!isCrmVerticalScaffold(options)) return files;

  const deal = findModel(options.dataModels, "Deal");
  if (!deal) return files;

  const next = files.map((file) => ({ ...file }));
  const dealsPath = `app/dashboard/${entitySlug(deal.name)}/page.tsx`;
  const pipeline = {
    path: dealsPath,
    language: "tsx" as const,
    content: buildCrmPipelinePage(deal),
  };

  const existingIdx = next.findIndex((file) => file.path === dealsPath);
  if (existingIdx >= 0) next[existingIdx] = pipeline;
  else next.push(pipeline);

  next.push({
    path: "prisma/seed.ts",
    language: "typescript",
    content: buildCrmSeedFile(options.dataModels ?? []),
  });

  const pkgIdx = next.findIndex((file) => file.path === "package.json");
  if (pkgIdx >= 0) {
    try {
      const pkg = JSON.parse(next[pkgIdx].content) as Record<string, unknown>;
      const scripts = {
        ...((pkg.scripts as Record<string, string> | undefined) ?? {}),
        "db:seed": "npx tsx prisma/seed.ts",
      };
      pkg.scripts = scripts;
      pkg.prisma = { seed: "npx tsx prisma/seed.ts" };
      next[pkgIdx] = {
        ...next[pkgIdx],
        content: `${JSON.stringify(pkg, null, 2)}\n`,
      };
    } catch {
      // keep original package.json if parse fails
    }
  }

  const readmeIdx = next.findIndex((file) => file.path === "README.md");
  if (readmeIdx >= 0) {
    next[readmeIdx] = {
      ...next[readmeIdx],
      content: `${next[readmeIdx].content.trim()}\n\n## CRM sample data\n\nAfter \`npx prisma db push\`, load a realistic pipeline:\n\n\`\`\`bash\nnpm run db:seed\n\`\`\`\n\nThen open \`/dashboard/deals\` for the stage board.\n`,
    };
  }

  return next;
}
