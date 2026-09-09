/**
 * Finance vertical: ledger summary dashboard + accounts seed.
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

export function isFinanceVerticalScaffold(input: {
  templateId?: string | null;
  dataModels?: AppDataModel[];
}): boolean {
  if ((input.templateId || "").toLowerCase() === "finance") return true;
  const names = modelNames(input.dataModels);
  return names.has("ledgeraccount") && names.has("transaction");
}

function buildFinanceLedgerPage(
  accountModel: AppDataModel,
  transactionModel: AppDataModel,
): string {
  const accountSlug = entitySlug(accountModel.name);
  const txSlug = entitySlug(transactionModel.name);
  const accountApi = JSON.stringify(`/api/${accountSlug}`);
  const txApi = JSON.stringify(`/api/${txSlug}`);

  return `"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { t } from "@/lib/i18n";

type RecordRow = Record<string, unknown> & { id: string };

const ACCOUNT_API = ${accountApi};
const TX_API = ${txApi};

function money(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return t("common.emptyValue");
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function FinanceLedgerPage() {
  const [accounts, setAccounts] = useState<RecordRow[]>([]);
  const [transactions, setTransactions] = useState<RecordRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [aRes, tRes] = await Promise.all([
        fetch(ACCOUNT_API, { credentials: "include" }),
        fetch(TX_API, { credentials: "include" }),
      ]);
      const aJson = await aRes.json().catch(() => ({}));
      const tJson = await tRes.json().catch(() => ({}));
      if (!aRes.ok || !tRes.ok) throw new Error("Failed to load ledger");
      setAccounts(Array.isArray(aJson.data) ? aJson.data : []);
      setTransactions(Array.isArray(tJson.data) ? tJson.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ledger");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalBalance = useMemo(
    () =>
      accounts.reduce((sum, row) => {
        const n = Number(row.balance);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0),
    [accounts],
  );

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
        .slice(0, 8),
    [transactions],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance ledger</h1>
        <p className="text-sm text-muted-foreground">
          Account balances and recent movements. Run npm run db:seed after ZIP deploy for demo books.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{accounts.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{transactions.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Book balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{money(totalBalance)}</CardContent>
        </Card>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Chart of accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {accounts.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div>
                  <div className="font-medium">{String(row.name ?? row.id)}</div>
                  <div className="text-xs capitalize text-muted-foreground">
                    {String(row.type || "")} · {String(row.code || "")}
                  </div>
                </div>
                <div className="font-semibold">{money(row.balance)}</div>
              </div>
            ))}
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.emptyValue")}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div>
                  <div className="font-medium">{String(row.memo || row.reference || row.id)}</div>
                  <div className="text-xs text-muted-foreground">{String(row.date || "")}</div>
                </div>
                <div className="font-semibold">{money(row.amount)}</div>
              </div>
            ))}
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.emptyValue")}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;
}

function buildFinanceSeed(dataModels: AppDataModel[]): string {
  const account = findDataModel(dataModels, "LedgerAccount");
  const transaction = findDataModel(dataModels, "Transaction");
  const budget = findDataModel(dataModels, "Budget");
  const report = findDataModel(dataModels, "Report");
  const accountD = account ? prismaClientDelegate(toPrismaModelName(account.name)) : null;
  const transactionD = transaction
    ? prismaClientDelegate(toPrismaModelName(transaction.name))
    : null;
  const budgetD = budget ? prismaClientDelegate(toPrismaModelName(budget.name)) : null;
  const reportD = report ? prismaClientDelegate(toPrismaModelName(report.name)) : null;

  return buildPrismaSeedShell(`  ${accountD ? `await prisma.${accountD}.deleteMany();` : ""}
  ${transactionD ? `await prisma.${transactionD}.deleteMany();` : ""}
  ${budgetD ? `await prisma.${budgetD}.deleteMany();` : ""}
  ${reportD ? `await prisma.${reportD}.deleteMany();` : ""}

  ${
    accountD
      ? `const accounts = await Promise.all([
    prisma.${accountD}.create({ data: { name: "Operating Cash", code: "1000", type: "asset", balance: 42000, currency: "USD" } }),
    prisma.${accountD}.create({ data: { name: "Accounts Receivable", code: "1100", type: "asset", balance: 12500, currency: "USD" } }),
    prisma.${accountD}.create({ data: { name: "Software Expense", code: "5100", type: "expense", balance: 3200, currency: "USD" } }),
  ]);`
      : "const accounts: Array<{ id: string }> = [];"
  }

  ${
    transactionD
      ? `await Promise.all([
    prisma.${transactionD}.create({ data: { accountId: accounts[0]?.id ?? "", amount: 2500, date: new Date("2026-04-01"), memo: "Client payment", reference: "INV-204" } }),
    prisma.${transactionD}.create({ data: { accountId: accounts[2]?.id ?? "", amount: -480, date: new Date("2026-04-02"), memo: "SaaS tools", reference: "EXP-88" } }),
    prisma.${transactionD}.create({ data: { accountId: accounts[1]?.id ?? "", amount: 1800, date: new Date("2026-04-03"), memo: "Milestone invoice", reference: "INV-205" } }),
  ]);`
      : ""
  }

  ${
    budgetD
      ? `await Promise.all([
    prisma.${budgetD}.create({ data: { name: "Q2 Marketing", category: "Growth", limit: 8000, spent: 2450, period: "2026-Q2" } }),
    prisma.${budgetD}.create({ data: { name: "Ops", category: "Operations", limit: 12000, spent: 6100, period: "2026-Q2" } }),
  ]);`
      : ""
  }

  ${
    reportD
      ? `await Promise.all([
    prisma.${reportD}.create({ data: { name: "P&L April", period: "2026-04", status: "ready", summary: "Healthy cash position", generatedAt: new Date("2026-04-05") } }),
  ]);`
      : ""
  }
`);
}

export function applyFinanceVerticalScaffold(
  files: GeneratedProjectFile[],
  options: { templateId?: string | null; dataModels?: AppDataModel[] },
): GeneratedProjectFile[] {
  if (!isFinanceVerticalScaffold(options)) return files;
  const account = findDataModel(options.dataModels, "LedgerAccount");
  const transaction = findDataModel(options.dataModels, "Transaction");
  if (!account || !transaction) return files;

  // Replace transactions page with ledger overview (accounts + recent txs).
  const next = upsertFile(files, {
    path: `app/dashboard/${entitySlug(transaction.name)}/page.tsx`,
    language: "tsx",
    content: buildFinanceLedgerPage(account, transaction),
  });

  return attachPrismaSeed(
    next,
    buildFinanceSeed(options.dataModels ?? []),
    [
      "## Finance sample data",
      "",
      "After `npx prisma db push`, load ledger sample data:",
      "",
      "```bash",
      "npm run db:seed",
      "```",
      "",
      "Then open `/dashboard/transactions` for the ledger summary.",
    ].join("\n"),
  );
}
