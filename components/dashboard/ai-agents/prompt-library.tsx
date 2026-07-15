"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Copy, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard, DashboardCardContent, DashboardCardHeader,
  DashboardCardTitle, DashboardCardDescription, DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { PROMPT_CATEGORIES } from "@/lib/constants/ai-agents";
import type { PromptLibraryEntry } from "@/types/agents";

export function PromptLibrary() {
  const [prompts, setPrompts] = useState<PromptLibraryEntry[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [promptText, setPromptText] = useState("");
  const [filter, setFilter] = useState("");

  const fetchPrompts = useCallback(async () => {
    const params = filter ? `?category=${filter}` : "";
    try {
      const res = await fetch(`/api/ai-agents/prompts${params}&limit=50`);
      if (!res.ok) return;
      const d = await res.json();
      setPrompts(d.prompts ?? []);
    } catch { /* ignore */ }
  }, [filter]);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  const handleCreate = async () => {
    if (!title.trim() || !promptText.trim()) { toast.error("Title and prompt text are required"); return; }
    const res = await fetch("/api/ai-agents/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, promptText }),
    });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? "Failed"); return; }
    toast.success("Prompt saved");
    setTitle(""); setPromptText(""); setShowCreate(false);
    fetchPrompts();
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-premium-gold-light" />
          <h2 className="text-sm font-bold text-white/80">Prompt Library</h2>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={cn(dashboardSelectClass, "w-36")}>
            <option value="">All Categories</option>
            {PROMPT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="btn-gold gap-1.5 rounded-xl text-xs font-bold text-luxury-black">
            <Plus className="size-3" /> Add Prompt
          </Button>
        </div>
      </div>

      {showCreate && (
        <DashboardCard>
          <DashboardCardHeader><DashboardCardTitle>Save New Prompt</DashboardCardTitle></DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Title *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prompt title" className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={dashboardSelectClass}>
                    {PROMPT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Prompt Text *</label>
                <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Write your reusable prompt here..."
                  className={cn(dashboardInputClass, "min-h-[100px] resize-y")} rows={4} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg border-white/10 text-white/50" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" className="btn-gold rounded-lg font-bold text-luxury-black" onClick={handleCreate}>Save Prompt</Button>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {prompts.length === 0 ? (
        <DashboardPanel className="py-10 text-center">
          <BookOpen className="mx-auto size-8 text-white/10" />
          <p className="mt-3 text-xs text-white/30">No prompts saved yet</p>
          <p className="mt-1 text-[10px] text-white/20">Save reusable prompts for your agents</p>
        </DashboardPanel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {prompts.map((p) => (
            <DashboardPanel key={p.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-white/90">{p.title}</p>
                  <p className="text-[10px] text-white/30">{p.category} &middot; Used {p.usage_count} times</p>
                </div>
                <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-premium-gold-light" onClick={() => copyPrompt(p.prompt_text)}>
                  <Copy className="size-3" />
                </Button>
              </div>
              <p className="flex-1 text-[11px] text-white/40">{p.prompt_text.slice(0, 150)}{p.prompt_text.length > 150 ? "..." : ""}</p>
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="flex items-center gap-0.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30">
                      <Tag className="size-2.5" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </DashboardPanel>
          ))}
        </div>
      )}
    </div>
  );
}
