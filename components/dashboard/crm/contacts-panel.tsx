"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CRMContact } from "@/types/crm";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function ContactsPanel({ initialContacts = [] }: { initialContacts?: CRMContact[] }) {
  const wt = useWorkspaceT("crm");
  const [contacts, setContacts] = useState(initialContacts);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mergeSecondary, setMergeSecondary] = useState("");

  const create = async () => {
    if (!email.trim()) return toast.error(wt("toasts.emailRequired"));
    const res = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setContacts([data.contact, ...contacts]);
    setEmail("");
    toast.success(wt("toasts.contactCreated"));
  };

  const merge = async (primaryId: string) => {
    if (!mergeSecondary) return toast.error(wt("panels.contacts.secondaryIdRequired"));
    const res = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "merge", primaryId, secondaryId: mergeSecondary }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.mergeFailed"));
    setContacts(contacts.filter((c) => c.id !== mergeSecondary).map((c) => (c.id === primaryId ? data.contact : c)));
    setMergeSecondary("");
    toast.success(wt("toasts.contactsMerged"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={wt("forms.email")} className="border-white/10 bg-white/5 text-white" />
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={wt("forms.firstName")} className="border-white/10 bg-white/5 text-white" />
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={wt("forms.lastName")} className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void create()}>{wt("panels.contacts.addContact")}</Button>
      </div>
      <Input value={mergeSecondary} onChange={(e) => setMergeSecondary(e.target.value)} placeholder={wt("forms.secondaryIdMerge")} className="border-white/10 bg-white/5 text-white" />
      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2 text-sm">
            <div>
              <p className="text-white">{c.first_name} {c.last_name} · {c.email}</p>
              <p className="text-xs text-white/40">{c.lifecycle_stage} · {c.tags?.join(", ")}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void merge(c.id)}>{wt("panels.contacts.merge")}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
