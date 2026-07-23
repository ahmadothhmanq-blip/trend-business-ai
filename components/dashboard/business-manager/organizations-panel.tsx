"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Organization } from "@/types/business-manager";

type Props = {
  initialOrganizations?: Organization[];
};

export function OrganizationsPanel({ initialOrganizations = [] }: Props) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!name.trim()) {
      toast.error("Organization name is required.");
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
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setOrganizations([data.organization, ...organizations]);
      setName("");
      setIndustry("");
      toast.success("Organization created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">New organization</p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organization name"
            className="max-w-xs border-white/10 bg-white/5 text-white"
          />
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry"
            className="max-w-xs border-white/10 bg-white/5 text-white"
          />
          <Button onClick={() => void create()} disabled={saving}>
            <Plus className="mr-2 size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <div key={org.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{org.name}</p>
            <p className="text-sm text-white/40">{org.industry || "General"}</p>
            {org.description && <p className="mt-2 text-sm text-white/60">{org.description}</p>}
          </div>
        ))}
        {organizations.length === 0 && (
          <p className="text-sm text-white/30">Create your first organization to get started.</p>
        )}
      </div>
    </div>
  );
}
