/**
 * Deterministic domain/framework scaffolds for App Builder.
 * Prisma schema, CRUD APIs, entity pages, providers, hooks — never DeepSeek.
 */

import type { AppDataField, AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import { entitySlug } from "@/lib/ai/webapp-requirements";

const AUTH_SKIP = new Set([
  "user",
  "users",
  "account",
  "session",
  "verificationtoken",
]);

export function businessEntityTables(tables: string[], limit = 8): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tables) {
    const name = raw.trim();
    if (!name || AUTH_SKIP.has(name.toLowerCase())) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= limit) break;
  }
  return out;
}

export function toPrismaModelName(table: string): string {
  const parts = table
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const name = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return name || "Item";
}

export function prismaClientDelegate(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function prismaScalarForField(field: AppDataField): { type: string; attrs: string } {
  const attrs: string[] = [];
  if (field.unique) attrs.push("@unique");

  switch (field.type) {
    case "number":
    case "money":
      if (field.defaultValue != null && typeof field.defaultValue === "number") {
        attrs.push(`@default(${field.defaultValue})`);
      } else if (field.required !== false) {
        attrs.push("@default(0)");
      }
      return {
        type: field.required === false ? "Float?" : "Float",
        attrs: attrs.join(" "),
      };
    case "boolean":
      if (typeof field.defaultValue === "boolean") {
        attrs.push(`@default(${field.defaultValue})`);
      } else if (field.required !== false) {
        attrs.push("@default(false)");
      }
      return {
        type: field.required === false ? "Boolean?" : "Boolean",
        attrs: attrs.join(" "),
      };
    case "date":
      if (field.required !== false) attrs.push("@default(now())");
      return {
        type: field.required === false ? "DateTime?" : "DateTime",
        attrs: attrs.join(" "),
      };
    case "relation":
      return {
        type: field.required === false ? "String?" : "String",
        attrs: [...attrs, field.required === false ? "" : '@default("")']
          .filter(Boolean)
          .join(" "),
      };
    case "enum":
    case "json":
    case "image":
    case "string":
    default: {
      if (typeof field.defaultValue === "string") {
        attrs.push(`@default(${JSON.stringify(field.defaultValue)})`);
      } else if (field.required !== false) {
        attrs.push('@default("")');
      }
      return {
        type: field.required === false ? "String?" : "String",
        attrs: attrs.join(" "),
      };
    }
  }
}

function buildModelBlockFromDataModel(dataModel: AppDataModel): string {
  const model = toPrismaModelName(dataModel.name);
  const lines: string[] = ["  id        String   @id @default(cuid())"];
  const used = new Set(["id", "createdat", "updatedat"]);

  for (const field of dataModel.fields) {
    const fieldName = field.name.trim();
    if (!fieldName) continue;
    const key = fieldName.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    const { type, attrs } = prismaScalarForField(field);
    const pad = " ".repeat(Math.max(1, 10 - fieldName.length));
    lines.push(`  ${fieldName}${pad}${type}${attrs ? ` ${attrs}` : ""}`);
  }

  if (!used.has("ownerid")) {
    lines.push(`  ownerId   String`);
    used.add("ownerid");
  }

  if (!used.has("name") && dataModel.fields.length === 0) {
    lines.push(`  name      String   @default("")`);
    lines.push(`  notes     String   @default("")`);
  }

  lines.push(`  createdAt DateTime @default(now())`);
  lines.push(`  updatedAt DateTime @updatedAt`);

  return `model ${model} {
${lines.join("\n")}
}
`;
}

function buildFallbackModelBlock(table: string): string {
  const model = toPrismaModelName(table);
  return `model ${model} {
  id        String   @id @default(cuid())
  name      String   @default("")
  notes     String   @default("")
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

export function buildCanonicalPrismaSchema(
  tables: string[],
  dataModels: AppDataModel[] = [],
): string {
  const entities = businessEntityTables(tables);
  const models =
    entities.length > 0
      ? entities
      : dataModels.length > 0
        ? businessEntityTables(dataModels.map((m) => m.name))
        : ["Item"];

  const byName = new Map(
    dataModels.map((model) => [toPrismaModelName(model.name).toLowerCase(), model]),
  );

  const modelBlocks = models.map((table) => {
    const key = toPrismaModelName(table).toLowerCase();
    const dataModel = byName.get(key);
    return dataModel
      ? buildModelBlockFromDataModel(dataModel)
      : buildFallbackModelBlock(table);
  });

  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  role         String    @default("user")
  sessions     Session[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

${modelBlocks.join("\n")}`;
}

/** Fields that must never be client-writable on generated CRUD APIs. */
export const CRUD_PROTECTED_SYSTEM_FIELDS = [
  "id",
  "ownerId",
  "role",
  "userId",
  "passwordHash",
  "createdAt",
  "updatedAt",
  "token",
  "expiresAt",
  "sessionId",
] as const;

const CRUD_PROTECTED_SYSTEM_FIELD_SET = new Set(
  CRUD_PROTECTED_SYSTEM_FIELDS.map((name) => name.toLowerCase()),
);

export type CrudWritableField = {
  name: string;
  /** Zod expression used in create schema (may already include `.optional()`). */
  zodExpr: string;
};

export function isCrudProtectedSystemField(name: string): boolean {
  return CRUD_PROTECTED_SYSTEM_FIELD_SET.has(name.trim().toLowerCase());
}

function zodExprForAppField(field: AppDataField): string {
  const optional = field.required === false;
  let base: string;
  switch (field.type) {
    case "number":
    case "money":
      base = "z.number()";
      break;
    case "boolean":
      base = "z.boolean()";
      break;
    case "date":
      base = "z.coerce.date()";
      break;
    case "json":
      base = "z.unknown()";
      break;
    case "enum":
      base =
        field.enumValues && field.enumValues.length > 0
          ? `z.enum([${field.enumValues.map((value) => JSON.stringify(value)).join(", ")}])`
          : "z.string()";
      break;
    case "relation":
    case "image":
    case "string":
    default:
      base = "z.string()";
      break;
  }
  return optional ? `${base}.optional()` : base;
}

/**
 * Resolve allowlisted writable fields for an entity CRUD route.
 * Never includes protected system fields (id, ownerId, role, timestamps, …).
 */
export function resolveCrudWritableFields(
  _table: string,
  options?: {
    dataModel?: AppDataModel | null;
    fieldNames?: string[];
  },
): CrudWritableField[] {
  const dataModel = options?.dataModel;
  if (dataModel?.fields?.length) {
    const fields: CrudWritableField[] = [];
    for (const field of dataModel.fields) {
      const name = field.name.trim();
      if (!name || isCrudProtectedSystemField(name)) continue;
      fields.push({ name, zodExpr: zodExprForAppField(field) });
    }
    if (fields.length > 0) return fields;
  }

  const fieldNames = options?.fieldNames ?? [];
  const fromNames = fieldNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0 && !isCrudProtectedSystemField(name));
  if (fromNames.length > 0) {
    return fromNames.map((name) => ({
      name,
      zodExpr: name === "notes" ? "z.string().optional()" : "z.string()",
    }));
  }

  return [
    { name: "name", zodExpr: "z.string()" },
    { name: "notes", zodExpr: "z.string().optional()" },
  ];
}

export function extractPrismaModelFieldNames(
  schema: string,
  modelName: string,
): string[] {
  const escaped = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = schema.match(new RegExp(`model\\s+${escaped}\\s*\\{([^}]*)\\}`));
  if (!block) return [];
  const names: string[] = [];
  for (const line of block[1].split("\n")) {
    const match = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s+/);
    if (match) names.push(match[1]);
  }
  return names;
}

function buildZodSchemaLiteral(
  fields: CrudWritableField[],
  mode: "create" | "update",
): string {
  const lines: string[] = [];
  if (mode === "update") {
    lines.push("  id: z.string().min(1),");
  }
  for (const field of fields) {
    if (mode === "update") {
      const base = field.zodExpr.replace(/\.optional\(\)$/, "");
      lines.push(`  ${field.name}: ${base}.optional(),`);
    } else {
      lines.push(`  ${field.name}: ${field.zodExpr},`);
    }
  }
  return `z.object({\n${lines.join("\n")}\n}).strict()`;
}

/** True when a generated CRUD route rejects unknown fields via Zod `.strict()`. */
export function crudRouteHasInputValidation(content: string): boolean {
  const hasZodStrict =
    /from\s+["']zod["']/.test(content) &&
    /\.strict\s*\(/.test(content) &&
    /safeParse\s*\(/.test(content);
  return hasZodStrict && !crudRouteHasMassAssignmentRisk(content);
}

/** Detects unsafe body → ORM create/update patterns. */
export function crudRouteHasMassAssignmentRisk(content: string): boolean {
  if (/create\s*\(\s*\{[^}]*\bdata\s*:\s*body\b/.test(content)) return true;
  if (/\bdata\s*:\s*body\s+as\s+never\b/.test(content)) return true;
  if (/\bdata\s*:\s*body\b/.test(content) && !/safeParse/.test(content)) return true;
  if (
    /\{\s*[^}]*\.\.\.\s*(?:rest|body)\b/.test(content) &&
    /(?:create|update)\s*\(/.test(content) &&
    !/parsed\.data/.test(content)
  ) {
    return true;
  }
  if (
    /as\s+Record<\s*string\s*,\s*unknown\s*>/.test(content) &&
    /(?:create|update)\s*\(/.test(content) &&
    !/safeParse/.test(content)
  ) {
    return true;
  }
  return false;
}

export function buildCanonicalCrudApiRoute(
  table: string,
  options?: {
    dataModel?: AppDataModel | null;
    fieldNames?: string[];
  },
): string {
  const model = toPrismaModelName(table);
  const delegate = prismaClientDelegate(model);
  const writable = resolveCrudWritableFields(table, options);
  const createSchema = buildZodSchemaLiteral(writable, "create");
  const updateSchema = buildZodSchemaLiteral(writable, "update");

  return `import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isStaffRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type OwnedRow = { ownerId?: string | null };

const createSchema = ${createSchema};

const updateSchema = ${updateSchema};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: t("crud.unauthorized") }, { status: 401 });
  }
  const data = isStaffRole(session.role)
    ? await db.${delegate}.findMany({ take: 100 })
    : await db.${delegate}.findMany({
        where: { ownerId: session.userId } as never,
        take: 100,
      });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: t("crud.unauthorized") }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t("crud.invalidBody"), details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = await db.${delegate}.create({
    data: { ...parsed.data, ownerId: session.userId } as never,
  });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: t("crud.unauthorized") }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t("crud.invalidBody"), details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id, ...data } = parsed.data;
  const existing = (await db.${delegate}.findUnique({
    where: { id } as never,
  })) as OwnedRow | null;
  if (!existing) {
    return NextResponse.json({ error: t("crud.notFound") }, { status: 404 });
  }
  if (!isStaffRole(session.role) && existing.ownerId !== session.userId) {
    return NextResponse.json({ error: t("crud.forbidden") }, { status: 403 });
  }
  const updated = await db.${delegate}.update({
    where: { id } as never,
    data: data as never,
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: t("crud.unauthorized") }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: t("crud.idRequired") }, { status: 400 });
  }
  const existing = (await db.${delegate}.findUnique({
    where: { id } as never,
  })) as OwnedRow | null;
  if (!existing) {
    return NextResponse.json({ error: t("crud.notFound") }, { status: 404 });
  }
  if (!isStaffRole(session.role) && existing.ownerId !== session.userId) {
    return NextResponse.json({ error: t("crud.forbidden") }, { status: 403 });
  }
  await db.${delegate}.delete({ where: { id } as never });
  return NextResponse.json({ ok: true });
}
`;
}

type EntityDashboardFieldMeta = {
  name: string;
  type: AppDataField["type"];
  required: boolean;
  enumValues: string[];
};

function resolveEntityDashboardFields(
  table: string,
  dataModel?: AppDataModel | null,
): EntityDashboardFieldMeta[] {
  const writable = resolveCrudWritableFields(table, { dataModel });
  const byName = new Map(
    (dataModel?.fields ?? []).map((field) => [field.name.trim(), field] as const),
  );
  return writable.map((field) => {
    const source = byName.get(field.name);
    return {
      name: field.name,
      type: source?.type ?? "string",
      required: source ? source.required !== false : !field.zodExpr.includes(".optional()"),
      enumValues: source?.enumValues?.filter(Boolean) ?? [],
    };
  });
}

export function buildCanonicalEntityDashboardPage(
  table: string,
  options?: { dataModel?: AppDataModel | null },
): string {
  const model = toPrismaModelName(table);
  const slug = entitySlug(table);
  const entityLiteral = JSON.stringify(model);
  const apiPath = JSON.stringify(`/api/${slug}`);
  const fields = resolveEntityDashboardFields(table, options?.dataModel);
  const fieldsLiteral = JSON.stringify(fields);
  const displayFields = fields.slice(0, 4);
  const displayFieldsLiteral = JSON.stringify(displayFields.map((field) => field.name));
  const colSpan = displayFields.length + 1;

  return `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { t, te } from "@/lib/i18n";

type FieldMeta = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "enum" | "relation" | "json" | "money" | "image";
  required: boolean;
  enumValues: string[];
};

type RecordRow = Record<string, unknown> & { id: string };

const ENTITY = ${entityLiteral};
const API_PATH = ${apiPath};
const FIELDS: FieldMeta[] = ${fieldsLiteral};
const DISPLAY_FIELDS: string[] = ${displayFieldsLiteral};

function humanizeField(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\\w/, (char) => char.toUpperCase());
}

function emptyForm(): Record<string, string> {
  const next: Record<string, string> = {};
  for (const field of FIELDS) {
    next[field.name] = field.type === "boolean" ? "false" : "";
  }
  return next;
}

function coercePayload(form: Record<string, string>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const raw = form[field.name] ?? "";
    if (!field.required && (raw === "" || raw == null)) continue;
    switch (field.type) {
      case "number":
      case "money": {
        const value = Number(raw);
        if (Number.isFinite(value)) payload[field.name] = value;
        break;
      }
      case "boolean":
        payload[field.name] = raw === "true" || raw === "1" || raw === "on";
        break;
      case "date":
        payload[field.name] = raw;
        break;
      default:
        payload[field.name] = raw;
        break;
    }
  }
  return payload;
}

function formatCell(value: unknown): string {
  if (value == null || value === "") return t("common.emptyValue");
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ${model}DashboardPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const requiredOk = useMemo(() => {
    return FIELDS.every((field) => {
      if (!field.required) return true;
      const value = (form[field.name] ?? "").trim();
      if (field.type === "boolean") return true;
      return value.length > 0;
    });
  }, [form]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(API_PATH);
      if (!res.ok) {
        setError(t("crud.unableLoad"));
        return;
      }
      const body = (await res.json()) as { data?: RecordRow[] };
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch {
      setError(t("auth.unableReachServer"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!requiredOk) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coercePayload(form)),
      });
      if (!res.ok) {
        setError(t("crud.unableCreate"));
        return;
      }
      setForm(emptyForm());
      await load();
    } catch {
      setError(t("auth.unableReachServer"));
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(\`\${API_PATH}?id=\${encodeURIComponent(id)}\`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(t("crud.unableDelete"));
        return;
      }
      await load();
    } catch {
      setError(t("auth.unableReachServer"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("crud.recordsTitle", { entity: te(ENTITY) })}
        </h1>
        <p className="text-muted-foreground">{t("crud.recordsSubtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("crud.newRecord")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const id = \`field-\${field.name}\`;
              const label =
                field.name === "name"
                  ? t("common.name")
                  : field.name === "notes"
                    ? t("common.notes")
                    : humanizeField(field.name);
              if (field.type === "boolean") {
                return (
                  <div key={field.name} className="flex items-center gap-2 space-y-0 pt-6">
                    <input
                      id={id}
                      type="checkbox"
                      checked={form[field.name] === "true"}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.name]: e.target.checked ? "true" : "false",
                        }))
                      }
                    />
                    <Label htmlFor={id}>{label}</Label>
                  </div>
                );
              }
              if (field.type === "enum" && field.enumValues.length > 0) {
                return (
                  <div key={field.name} className="space-y-1">
                    <Label htmlFor={id}>{label}</Label>
                    <select
                      id={id}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form[field.name] ?? ""}
                      required={field.required}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                    >
                      <option value="">{t("common.emptyValue")}</option>
                      {field.enumValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              const inputType =
                field.type === "number" || field.type === "money"
                  ? "number"
                  : field.type === "date"
                    ? "date"
                    : "text";
              return (
                <div key={field.name} className="space-y-1">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type={inputType}
                    value={form[field.name] ?? ""}
                    required={field.required}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                  />
                </div>
              );
            })}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending || !requiredOk}>
                {pending ? t("common.saving") : t("common.create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("common.records")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {DISPLAY_FIELDS.map((name) => (
                  <TableHead key={name}>
                    {name === "name"
                      ? t("common.name")
                      : name === "notes"
                        ? t("common.notes")
                        : humanizeField(name)}
                  </TableHead>
                ))}
                <TableHead className="w-28">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={${colSpan}} className="text-muted-foreground">
                    {t("crud.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {DISPLAY_FIELDS.map((name) => (
                      <TableCell key={name}>{formatCell(row[name])}</TableCell>
                    ))}
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => void onDelete(row.id)}
                      >
                        {t("common.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
`;
}

export function buildCanonicalProviders(): string {
  return `"use client";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
`;
}

export function buildCanonicalDashboardLayout(options: {
  title: string;
  entityLinks?: Array<{ entity: string; href: string }>;
  includeStaffNav?: boolean;
}): string {
  const titleLiteral = JSON.stringify(options.title);
  const entityNav = (options.entityLinks ?? []).map((link) => ({
    entity: link.entity,
    href: link.href,
  }));
  const entityNavLiteral = JSON.stringify(entityNav);
  const includeStaffNav = Boolean(options.includeStaffNav);

  if (!includeStaffNav) {
    return `import Link from "next/link";
import { t, te } from "@/lib/i18n";

const APP_TITLE = ${titleLiteral};
const ENTITY_NAV = ${entityNavLiteral} as Array<{ entity: string; href: string }>;

const NAV_LINKS = [
  { label: t("nav.overview"), href: "/dashboard" },
  ...ENTITY_NAV.map((item) => ({ label: te(item.entity), href: item.href })),
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-8 py-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            {APP_TITLE}
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
`;
  }

  return `import Link from "next/link";
import { getSession, isStaffRole } from "@/lib/auth";
import { t, te } from "@/lib/i18n";

const APP_TITLE = ${titleLiteral};
const ENTITY_NAV = ${entityNavLiteral} as Array<{ entity: string; href: string }>;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const navLinks = [
    { label: t("nav.overview"), href: "/dashboard" },
    ...ENTITY_NAV.map((item) => ({ label: te(item.entity), href: item.href })),
    ...(session && isStaffRole(session.role)
      ? [{ label: t("admin.staff.nav"), href: "/dashboard/admin/staff" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-8 py-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            {APP_TITLE}
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
`;
}

export function buildCanonicalTailwindConfig(): string {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;
}
