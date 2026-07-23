"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CRMContact } from "@/types/crm";

export function ContactsPanel({ initialContacts = [] }: { initialContacts?: CRMContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mergeSecondary, setMergeSecondary] = useState("");

  const create = async () => {
    if (!email.trim()) return toast.error("Email required");
    const res = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setContacts([data.contact, ...contacts]);
    setEmail("");
    toast.success("Contact created");
  };

  const merge = async (primaryId: string) => {
    if (!mergeSecondary) return toast.error("Enter secondary contact ID");
    const res = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "merge", primaryId, secondaryId: mergeSecondary }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Merge failed");
    setContacts(contacts.filter((c) => c.id !== mergeSecondary).map((c) => (c.id === primaryId ? data.contact : c)));
    setMergeSecondary("");
    toast.success("Contacts merged");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border-white/10 bg-white/5 text-white" />
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="border-white/10 bg-white/5 text-white" />
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void create()}>Add contact</Button>
      </div>
      <Input value={mergeSecondary} onChange={(e) => setMergeSecondary(e.target.value)} placeholder="Secondary ID to merge into selected" className="border-white/10 bg-white/5 text-white" />
      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2 text-sm">
            <div>
              <p className="text-white">{c.first_name} {c.last_name} · {c.email}</p>
              <p className="text-xs text-white/40">{c.lifecycle_stage} · {c.tags?.join(", ")}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void merge(c.id)}>Merge</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
