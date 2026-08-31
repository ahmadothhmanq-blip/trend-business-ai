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

export function businessEntityTables(tables: string[], limit = 4): string[] {
  return tables
    .map((name) => name.trim())
    .filter((name) => name.length > 0 && !AUTH_SKIP.has(name.toLowerCase()))
    .slice(0, limit);
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

export function buildCanonicalCrudApiRoute(table: string): string {
  const model = toPrismaModelName(table);
  const delegate = prismaClientDelegate(model);

  return `import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireSession() {
  return getSession();
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await db.${delegate}.findMany({ take: 100 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const data = await db.${delegate}.create({ data: body as never });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updated = await db.${delegate}.update({
    where: { id } as never,
    data: data as never,
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await db.${delegate}.delete({ where: { id } as never });
  return NextResponse.json({ ok: true });
}
`;
}

export function buildCanonicalEntityDashboardPage(table: string): string {
  const model = toPrismaModelName(table);
  const slug = entitySlug(table);
  const title = JSON.stringify(`${model} records`);
  const apiPath = JSON.stringify(`/api/${slug}`);

  return `"use client";

import { useCallback, useEffect, useState } from "react";
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

type RecordRow = {
  id: string;
  name?: string;
  notes?: string;
};

const TITLE = ${title};
const API_PATH = ${apiPath};

export default function ${model}DashboardPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(API_PATH);
      if (!res.ok) {
        setError("Unable to load records.");
        return;
      }
      const body = (await res.json()) as { data?: RecordRow[] };
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch {
      setError("Unable to reach the server.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notes }),
      });
      if (!res.ok) {
        setError("Unable to create record.");
        return;
      }
      setName("");
      setNotes("");
      await load();
    } catch {
      setError("Unable to reach the server.");
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
        setError("Unable to delete record.");
        return;
      }
      await load();
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{TITLE}</h1>
        <p className="text-muted-foreground">Create, review, and remove records.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? "Saving..." : "Create"}
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
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No records yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name || "—"}</TableCell>
                    <TableCell>{row.notes || "—"}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => void onDelete(row.id)}
                      >
                        Delete
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
  entityLinks?: Array<{ label: string; href: string }>;
}): string {
  const titleLiteral = JSON.stringify(options.title);
  const linksLiteral = JSON.stringify([
    { label: "Overview", href: "/dashboard" },
    ...(options.entityLinks ?? []),
  ]);

  return `import Link from "next/link";

const APP_TITLE = ${titleLiteral};
const NAV_LINKS = ${linksLiteral} as Array<{ label: string; href: string }>;

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
