"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CRMTask } from "@/types/crm";

export function TasksPanel({ initialTasks = [] }: { initialTasks?: CRMTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const create = async () => {
    if (!title.trim()) return toast.error("Title required");
    const res = await fetch("/api/crm/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate: dueDate || null }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setTasks([data.task, ...tasks]);
    setTitle("");
    toast.success("Task created");
  };

  const complete = async (id: string) => {
    const res = await fetch(`/api/crm/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setTasks(tasks.map((t) => (t.id === id ? data.task : t)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="border-white/10 bg-white/5 text-white" />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void create()}>Add task</Button>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2 text-sm">
            <div>
              <p className="text-white">{t.title}</p>
              <p className="text-xs text-white/40">{t.status} · {t.due_date?.slice(0, 10) ?? "No due date"}</p>
            </div>
            {t.status !== "done" && <Button size="sm" onClick={() => void complete(t.id)}>Done</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}
