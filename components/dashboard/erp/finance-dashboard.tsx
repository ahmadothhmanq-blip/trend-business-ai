"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErpAccount, ErpCompany, ErpExpense, ErpInvoice } from "@/types/erp";

type Props = {
  companyId: string;
  initialAccounts?: ErpAccount[];
  initialInvoices?: ErpInvoice[];
  initialExpenses?: ErpExpense[];
  initialCompanies?: ErpCompany[];
};

export function FinanceDashboard({
  companyId,
  initialAccounts = [],
  initialInvoices = [],
  initialExpenses = [],
  initialCompanies = [],
}: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [companies, setCompanies] = useState(initialCompanies);
  const [activeCompany, setActiveCompany] = useState(companyId);
  const [customerName, setCustomerName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("0");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("0");
  const [companyName, setCompanyName] = useState("");

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;
  const cid = activeCompany || companyId;

  const createCompany = async () => {
    if (!companyName.trim()) return toast.error("Company name required");
    const res = await fetch("/api/erp/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setCompanies([data.company, ...companies]);
    setActiveCompany(data.company.id);
    setCompanyName("");
    toast.success("Company created with default chart of accounts");
  };

  const createInvoice = async () => {
    if (!cid) return toast.error("Create a company first");
    const res = await fetch("/api/erp/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: cid, customerName, amountCents: Number(invoiceAmount) * 100 }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setInvoices([data.invoice, ...invoices]);
    toast.success("Invoice created");
  };

  const createExpense = async () => {
    if (!cid) return toast.error("Create a company first");
    const res = await fetch("/api/erp/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: cid, title: expenseTitle, amountCents: Number(expenseAmount) * 100 }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setExpenses([data.expense, ...expenses]);
    toast.success("Expense recorded");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="New company" className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void createCompany()}>Add company</Button>
        {companies.length > 0 && (
          <select value={cid} onChange={(e) => setActiveCompany(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs uppercase text-white/40">Chart of accounts</p>
          {accounts.map((a) => (
            <div key={a.id} className="text-sm text-white/70">{a.code} · {a.name} <span className="text-white/40">({a.account_type})</span></div>
          ))}
          {accounts.length === 0 && <p className="text-sm text-white/30">Default COA created with company.</p>}
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs uppercase text-white/40">New invoice</p>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer" className="border-white/10 bg-white/5 text-white" />
          <Input value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} placeholder="Amount USD" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createInvoice()}>Create invoice</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase text-white/40">Invoices</p>
          {invoices.map((i) => (
            <div key={i.id} className="rounded-lg border border-white/[0.06] px-3 py-2 text-sm text-white/70">
              {i.invoice_number} · {i.customer_name} · {money(i.amount_cents)} · {i.status}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase text-white/40">Expenses</p>
          <Input value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} placeholder="Expense title" className="border-white/10 bg-white/5 text-white" />
          <Input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Amount USD" className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createExpense()}>Add expense</Button>
          {expenses.map((e) => (
            <div key={e.id} className="rounded-lg border border-white/[0.06] px-3 py-2 text-sm text-white/70">
              {e.title} · {money(e.amount_cents)} · {e.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
