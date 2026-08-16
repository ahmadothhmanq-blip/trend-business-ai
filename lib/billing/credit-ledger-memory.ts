/**
 * In-memory credit ledger for deterministic settlement tests.
 * Enabled when BILLING_CREDIT_TEST_HARNESS=1.
 */
import type { CreditBalance, CreditLedgerReason } from "@/types/billing";

export type MemoryLedgerEntry = {
  user_id: string;
  delta: number;
  balance_after: number;
  reason: CreditLedgerReason;
  resource: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
};

type MemoryAccount = {
  balance: CreditBalance;
  ledger: MemoryLedgerEntry[];
};

const accounts = new Map<string, MemoryAccount>();

export function resetMemoryCreditLedger(): void {
  accounts.clear();
}

export function isMemoryCreditHarnessEnabled(): boolean {
  return process.env.BILLING_CREDIT_TEST_HARNESS === "1";
}

function accountFor(userId: string, initialBalance = 50): MemoryAccount {
  let account = accounts.get(userId);
  if (!account) {
    account = {
      balance: {
        user_id: userId,
        balance: initialBalance,
        lifetime_purchased: 0,
        lifetime_used: 0,
        updated_at: new Date().toISOString(),
      },
      ledger: [],
    };
    accounts.set(userId, account);
  }
  return account;
}

export function seedMemoryCreditBalance(userId: string, balance: number): CreditBalance {
  const account = accountFor(userId, balance);
  account.balance = {
    ...account.balance,
    balance,
    updated_at: new Date().toISOString(),
  };
  return { ...account.balance };
}

export function getMemoryCreditBalance(userId: string): CreditBalance {
  return { ...accountFor(userId).balance };
}

export function listMemoryCreditLedger(userId: string): MemoryLedgerEntry[] {
  return accountFor(userId).ledger.map((entry) => ({ ...entry, metadata: { ...entry.metadata } }));
}

export function memoryConsumeCredits(params: {
  userId: string;
  amount: number;
  resource: string;
  referenceId: string | null;
}): { ok: true; balance: CreditBalance } | { ok: false; code: "INSUFFICIENT_CREDITS"; balance: CreditBalance } {
  const account = accountFor(params.userId);
  if (params.referenceId) {
    const existing = account.ledger.find(
      (entry) => entry.reference_id === params.referenceId && entry.reason === "usage",
    );
    if (existing) {
      return { ok: true, balance: { ...account.balance } };
    }
  }

  if (account.balance.balance < params.amount) {
    return { ok: false, code: "INSUFFICIENT_CREDITS", balance: { ...account.balance } };
  }

  const nextBalance = account.balance.balance - params.amount;
  account.balance = {
    ...account.balance,
    balance: nextBalance,
    lifetime_used: account.balance.lifetime_used + params.amount,
    updated_at: new Date().toISOString(),
  };
  account.ledger.push({
    user_id: params.userId,
    delta: -params.amount,
    balance_after: nextBalance,
    reason: "usage",
    resource: params.resource,
    reference_id: params.referenceId,
    metadata: { amount: params.amount, settlement: "final" },
  });
  return { ok: true, balance: { ...account.balance } };
}

export function memoryRefundCredits(params: {
  userId: string;
  amount: number;
  resource: string;
  referenceId: string;
}): { ok: true; balance: CreditBalance; skipped?: boolean } {
  const account = accountFor(params.userId);
  const existingRefund = account.ledger.find(
    (entry) => entry.reference_id === params.referenceId && entry.reason === "refund",
  );
  if (existingRefund) {
    return { ok: true, skipped: true, balance: { ...account.balance } };
  }

  const usage = account.ledger.find(
    (entry) => entry.reference_id === params.referenceId && entry.reason === "usage",
  );
  if (!usage) {
    return { ok: true, skipped: true, balance: { ...account.balance } };
  }

  const refundAmount = Math.min(params.amount, Math.abs(usage.delta));
  const nextBalance = account.balance.balance + refundAmount;
  account.balance = {
    ...account.balance,
    balance: nextBalance,
    updated_at: new Date().toISOString(),
  };
  account.ledger.push({
    user_id: params.userId,
    delta: refundAmount,
    balance_after: nextBalance,
    reason: "refund",
    resource: params.resource,
    reference_id: params.referenceId,
    metadata: {
      amount: refundAmount,
      settlement: "refund",
      usage_delta: usage.delta,
    },
  });
  return { ok: true, balance: { ...account.balance } };
}
