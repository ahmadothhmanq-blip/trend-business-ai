"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CRMAccount } from "@/types/crm";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function AccountsPanel({ initialAccounts = [] }: { initialAccounts?: CRMAccount[] }) {
  const wt = useWorkspaceT("crm");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  const create = async () => {
    if (!name.trim()) return toast.error(wt("panels.accounts.accountNameRequired"));
    const res = await fetch("/api/crm/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, industry }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setAccounts([data.account, ...accounts]);
    setName("");
    toast.success(wt("toasts.accountCreated"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={wt("forms.companyName")} className="border-white/10 bg-white/5 text-white" />
        <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={wt("forms.industry")} className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void create()}>{wt("panels.accounts.addAccount")}</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{a.name}</p>
            <p className="text-sm text-white/40">{a.industry || "—"} · {a.size || "—"}</p>
            {a.notes && <p className="mt-2 text-sm text-white/60">{a.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
