"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CRMActivity } from "@/types/crm";

export function ActivitiesPanel({ initialActivities = [] }: { initialActivities?: CRMActivity[] }) {
  const [activities, setActivities] = useState(initialActivities);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<CRMActivity["activity_type"]>("note");

  const log = async () => {
    if (!subject.trim()) return toast.error("Subject required");
    const res = await fetch("/api/crm/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: type, subject, body }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setActivities([data.activity, ...activities]);
    setSubject("");
    setBody("");
    toast.success("Activity logged");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs uppercase text-white/40">Log activity</p>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CRMActivity["activity_type"])}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {(["call", "meeting", "email", "note"] as const).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="border-white/10 bg-white/5 text-white" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details" rows={3} className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void log()}>Log activity</Button>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase text-white/40">Timeline</p>
        {activities.map((a) => (
          <div key={a.id} className="rounded-lg border border-white/[0.06] px-3 py-2 text-sm">
            <p className="text-white">{a.subject} <span className="text-white/40">· {a.activity_type}</span></p>
            <p className="text-xs text-white/40">{new Date(a.occurred_at).toLocaleString()}</p>
            {a.body && <p className="mt-1 text-white/60">{a.body}</p>}
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-white/30">No activities yet.</p>}
      </div>
    </div>
  );
}
