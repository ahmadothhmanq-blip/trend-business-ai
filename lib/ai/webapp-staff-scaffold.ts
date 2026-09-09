/**
 * Staff role assignment scaffolds for generated App Builder apps.
 * Admin/manager/employee can list users and assign roles — never expose password hashes.
 */

export const ASSIGNABLE_USER_ROLES = [
  "admin",
  "manager",
  "employee",
  "user",
] as const;

export function buildCanonicalStaffUsersApiRoute(): string {
  const rolesLiteral = JSON.stringify([...ASSIGNABLE_USER_ROLES]);

  return `import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isStaffRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";

const ASSIGNABLE_ROLES = ${rolesLiteral} as const;

const updateRoleSchema = z
  .object({
    userId: z.string().min(1),
    role: z.enum(ASSIGNABLE_ROLES),
  })
  .strict();

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: t("crud.unauthorized") }, { status: 401 });
  }
  if (!isStaffRole(session.role)) {
    return NextResponse.json({ error: t("crud.forbidden") }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ data: users });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: t("crud.unauthorized") }, { status: 401 });
  }
  if (!isStaffRole(session.role)) {
    return NextResponse.json({ error: t("crud.forbidden") }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("crud.invalidBody") }, { status: 400 });
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: t("crud.invalidBody") }, { status: 400 });
  }

  const { userId, role } = parsed.data;
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!existing) {
    return NextResponse.json({ error: t("crud.notFound") }, { status: 404 });
  }

  if (existing.role === "admin" && role !== "admin") {
    const adminCount = await db.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: t("admin.staff.lastAdminGuard") },
        { status: 400 },
      );
    }
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({
    data: updated,
    message: t("admin.staff.roleUpdated"),
  });
}
`;
}

export function buildCanonicalStaffDashboardPage(): string {
  const rolesLiteral = JSON.stringify([...ASSIGNABLE_USER_ROLES]);

  return `"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { t, tr } from "@/lib/i18n";

type StaffUser = {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
};

const ASSIGNABLE_ROLES = ${rolesLiteral} as const;
const API_PATH = "/api/admin/users";

export default function StaffDashboardPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [draftRoles, setDraftRoles] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(API_PATH);
      if (!res.ok) {
        setError(t("crud.unableLoad"));
        return;
      }
      const body = (await res.json()) as { data?: StaffUser[] };
      const rows = Array.isArray(body.data) ? body.data : [];
      setUsers(rows);
      const next: Record<string, string> = {};
      for (const row of rows) next[row.id] = row.role;
      setDraftRoles(next);
    } catch {
      setError(t("auth.unableReachServer"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSaveRole(userId: string) {
    const role = draftRoles[userId];
    if (!role) return;
    setPendingId(userId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(API_PATH, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        data?: StaffUser;
      };
      if (!res.ok) {
        setError(body.error ?? t("admin.staff.unableUpdate"));
        return;
      }
      setMessage(body.message ?? t("admin.staff.roleUpdated"));
      await load();
    } catch {
      setError(t("auth.unableReachServer"));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("admin.staff.title")}
        </h1>
        <p className="text-muted-foreground">{t("admin.staff.subtitle")}</p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.staff.usersTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.staff.emailColumn")}</TableHead>
                <TableHead>{t("admin.staff.roleColumn")}</TableHead>
                <TableHead className="w-36">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    {t("crud.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const draft = draftRoles[user.id] ?? user.role;
                  const dirty = draft !== user.role;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <select
                          className="flex h-10 w-full max-w-[12rem] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={draft}
                          onChange={(e) =>
                            setDraftRoles((prev) => ({
                              ...prev,
                              [user.id]: e.target.value,
                            }))
                          }
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {tr(role)}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!dirty || pendingId === user.id}
                          onClick={() => void onSaveRole(user.id)}
                        >
                          {pendingId === user.id
                            ? t("common.saving")
                            : t("admin.staff.saveRole")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
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
