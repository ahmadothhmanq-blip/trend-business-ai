import type { ErpAccount, ErpJournalEntry, ErpTransaction } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_ACCOUNTS = [
  { code: "1000", name: "Cash", account_type: "asset" },
  { code: "1100", name: "Accounts Receivable", account_type: "asset" },
  { code: "2000", name: "Accounts Payable", account_type: "liability" },
  { code: "3000", name: "Equity", account_type: "equity" },
  { code: "4000", name: "Revenue", account_type: "revenue" },
  { code: "5000", name: "Expenses", account_type: "expense" },
] as const;

export async function listAccounts(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_accounts").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("code");
}

export async function ensureDefaultChartOfAccounts(supabase: SupabaseClient, userId: string, companyId: string) {
  const { data: existing } = await supabase.from("erp_accounts").select("id").eq("user_id", userId).eq("company_id", companyId).limit(1);
  if (existing?.length) return;
  await supabase.from("erp_accounts").insert(
    DEFAULT_ACCOUNTS.map((a) => ({
      user_id: userId,
      company_id: companyId,
      code: a.code,
      name: a.name,
      account_type: a.account_type,
    })),
  );
}

export async function createAccount(
  supabase: SupabaseClient,
  row: Partial<ErpAccount> & { user_id: string; company_id: string; code: string; name: string; account_type: ErpAccount["account_type"] },
) {
  return supabase
    .from("erp_accounts")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      code: row.code,
      name: row.name,
      account_type: row.account_type,
      parent_id: row.parent_id ?? null,
      balance_cents: row.balance_cents ?? 0,
      is_active: row.is_active ?? true,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listJournalEntries(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_journal_entries").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("created_at", { ascending: false });
}

export async function createJournalEntry(
  supabase: SupabaseClient,
  row: Partial<ErpJournalEntry> & { user_id: string; company_id: string; description: string },
) {
  const entryNumber = `JE-${Date.now()}`;
  return supabase
    .from("erp_journal_entries")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      entry_number: row.entry_number ?? entryNumber,
      description: row.description,
      status: row.status ?? "draft",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function createTransaction(
  supabase: SupabaseClient,
  row: Partial<ErpTransaction> & {
    user_id: string;
    company_id: string;
    account_id: string;
    debit_cents?: number;
    credit_cents?: number;
  },
) {
  return supabase
    .from("erp_transactions")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      account_id: row.account_id,
      journal_entry_id: row.journal_entry_id ?? null,
      description: row.description ?? "",
      debit_cents: row.debit_cents ?? 0,
      credit_cents: row.credit_cents ?? 0,
      occurred_at: row.occurred_at ?? new Date().toISOString(),
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export { listAccounts as listChartOfAccounts };
