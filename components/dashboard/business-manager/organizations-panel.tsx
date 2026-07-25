"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import type { Organization } from "@/types/business-manager";

type Props = {
  initialOrganizations?: Organization[];
};

export function OrganizationsPanel({ initialOrganizations = [] }: Props) {
  const wt = useWorkspaceT("businessManager");
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!name.trim()) {
      toast.error(wt("organizations.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/business-manager/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setOrganizations([data.organization, ...organizations]);
      setName("");
      setIndustry("");
      toast.success(wt("organizations.created"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">{wt("organizations.newOrganization")}</p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={wt("organizations.namePlaceholder")}
            className="max-w-xs border-white/10 bg-white/5 text-white"
          />
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder={wt("organizations.industryPlaceholder")}
            className="max-w-xs border-white/10 bg-white/5 text-white"
          />
          <Button onClick={() => void create()} disabled={saving}>
            <Plus className="mr-2 size-4" />
            {wt("organizations.add")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <div key={org.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{org.name}</p>
            <p className="text-sm text-white/40">{org.industry || wt("organizations.general")}</p>
            {org.description && <p className="mt-2 text-sm text-white/60">{org.description}</p>}
          </div>
        ))}
        {organizations.length === 0 && (
          <p className="text-sm text-white/30">{wt("organizations.empty")}</p>
        )}
      </div>
    </div>
  );
}
