"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CRMLead } from "@/types/crm";

export function LeadsPanel({ initialLeads = [], onLeadsChange }: { initialLeads?: CRMLead[]; onLeadsChange?: (l: CRMLead[]) => void }) {
  const [leads, setLeads] = useState(initialLeads);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const update = (next: CRMLead[]) => {
    setLeads(next);
    onLeadsChange?.(next);
  };

  const create = async () => {
    if (!email.trim()) return toast.error("Email required");
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, company }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    update([data.lead, ...leads]);
    setEmail("");
    toast.success("Lead created");
  };

  const convert = async (leadId: string) => {
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "convert", leadId, createDeal: true }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Convert failed");
    update(leads.map((l) => (l.id === leadId ? { ...l, status: "converted" as const } : l)));
    toast.success("Lead converted to contact + deal");
  };

  const qualify = async (id: string) => {
    const res = await fetch("/api/crm/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "qualified" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    update(leads.map((l) => (l.id === id ? data.lead : l)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border-white/10 bg-white/5 text-white" />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border-white/10 bg-white/5 text-white" />
        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void create()}>Add lead</Button>
      </div>
      <div className="space-y-2">
        {leads.map((l) => (
          <div key={l.id} className="rounded-lg border border-white/[0.06] px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-white">{l.name || l.email} · score {l.score}</span>
              <span className="text-xs capitalize text-white/40">{l.status}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => void qualify(l.id)}>Qualify</Button>
              {l.status !== "converted" && (
                <Button size="sm" onClick={() => void convert(l.id)}>Convert</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
