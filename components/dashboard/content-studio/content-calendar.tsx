"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import {
  CONTENT_CALENDAR_CATEGORIES,
  CONTENT_CALENDAR_STATUSES,
  CONTENT_PLATFORMS,
  CONTENT_TYPES,
  getCalendarStatusConfig,
  getContentTypeLabel,
} from "@/lib/constants/content-studio";
import type { CalendarEntry } from "@/types/content";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type EntryFormData = {
  title: string;
  content_type: string;
  description: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  category: string;
  tags: string;
  platform: string;
  notes: string;
};

const emptyForm = (date: string): EntryFormData => ({
  title: "",
  content_type: "blog-post",
  description: "",
  scheduled_date: date,
  scheduled_time: "",
  status: "draft",
  category: "General",
  tags: "",
  platform: "",
  notes: "",
});

export function ContentCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EntryFormData>(emptyForm(formatDate(today.getFullYear(), today.getMonth(), today.getDate())));
  const [view, setView] = useState<"month" | "week">("month");

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/content-studio/calendar?month=${month + 1}&year=${year}`);
      if (!res.ok) return;
      const d = await res.json();
      setEntries(d.entries ?? []);
    } catch { /* ignore */ }
  }, [month, year]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const openNewForm = (date: string) => {
    setForm(emptyForm(date));
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (entry: CalendarEntry) => {
    setForm({
      title: entry.title,
      content_type: entry.content_type,
      description: entry.description,
      scheduled_date: entry.scheduled_date,
      scheduled_time: entry.scheduled_time ?? "",
      status: entry.status,
      category: entry.category,
      tags: entry.tags.join(", "),
      platform: entry.platform,
      notes: entry.notes,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }

    const payload = {
      title: form.title,
      content_type: form.content_type,
      description: form.description,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time || null,
      status: form.status,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      platform: form.platform,
      notes: form.notes,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/content-studio/calendar/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Update failed"); return; }
        toast.success("Entry updated");
      } else {
        const res = await fetch("/api/content-studio/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) { const d = await res.json(); toast.error(d.error ?? "Creation failed"); return; }
        toast.success("Entry created");
      }
      setShowForm(false);
      fetchEntries();
    } catch { toast.error("Request failed"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/content-studio/calendar/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      fetchEntries();
    } catch { /* ignore */ }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const entriesByDate = entries.reduce<Record<string, CalendarEntry[]>>((acc, e) => {
    const dateKey = e.scheduled_date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(e);
    return acc;
  }, {});

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-xs" onClick={prevMonth} className="text-white/40 hover:text-white"><ChevronLeft className="size-4" /></Button>
          <h3 className="min-w-[10rem] text-center text-sm font-bold text-white">{MONTHS[month]} {year}</h3>
          <Button variant="ghost" size="icon-xs" onClick={nextMonth} className="text-white/40 hover:text-white"><ChevronRight className="size-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          {(["month", "week"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-lg px-3 py-1 text-xs font-medium transition-all", view === v ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{v === "month" ? "Month" : "Week"}</button>
          ))}
          <Button onClick={() => openNewForm(todayStr)} size="sm" className="btn-gold gap-1.5 rounded-lg text-xs font-bold text-luxury-black">
            <Plus className="size-3" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <DashboardPanel className="overflow-hidden p-0">
        <div className="grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="border-b border-r border-white/[0.06] bg-white/[0.02] px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/30 last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[5rem] border-b border-r border-white/[0.04] bg-white/[0.01] last:border-r-0 sm:min-h-[6rem]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(year, month, day);
            const dayEntries = entriesByDate[dateStr] ?? [];
            const isToday = dateStr === todayStr;

            return (
              <div key={day}
                className={cn("group min-h-[5rem] cursor-pointer border-b border-r border-white/[0.04] p-1 transition-colors hover:bg-white/[0.03] last:border-r-0 sm:min-h-[6rem] sm:p-1.5", isToday && "bg-premium-gold/[0.03]")}
                onClick={() => openNewForm(dateStr)}>
                <span className={cn("inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs", isToday ? "bg-premium-gold text-luxury-black" : "text-white/50")}>{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEntries.slice(0, 3).map((entry) => {
                    const statusCfg = getCalendarStatusConfig(entry.status);
                    return (
                      <button key={entry.id} onClick={(e) => { e.stopPropagation(); openEditForm(entry); }}
                        className={cn("block w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-medium leading-tight sm:text-[10px]", statusCfg?.color ?? "bg-white/5 text-white/40")}>
                        {entry.title}
                      </button>
                    );
                  })}
                  {dayEntries.length > 3 && <span className="block text-[9px] text-white/30">+{dayEntries.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </DashboardPanel>

      {/* Entry list below calendar */}
      {entries.length > 0 && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Scheduled Content</DashboardCardTitle>
            <DashboardCardDescription>{entries.length} entries in {MONTHS[month]}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-2">
              {entries.map((entry) => {
                const statusCfg = getCalendarStatusConfig(entry.status);
                return (
                  <DashboardPanel key={entry.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-[4rem] text-center">
                      <p className="text-xs font-bold text-premium-gold-light">{new Date(entry.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      {entry.scheduled_time && <p className="text-[10px] text-white/30">{entry.scheduled_time}</p>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white/80">{entry.title}</p>
                      <p className="text-[10px] text-white/40">{getContentTypeLabel(entry.content_type)}{entry.platform ? ` · ${entry.platform}` : ""}</p>
                    </div>
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", statusCfg?.color ?? "bg-white/5 text-white/40")}>{statusCfg?.label ?? entry.status}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => openEditForm(entry)}>
                        <CalendarDays className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-red-400" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </DashboardPanel>
                );
              })}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-luxury-black p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{editingId ? "Edit Entry" : "New Calendar Entry"}</h3>
              <Button variant="ghost" size="icon-xs" onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="size-4" /></Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={dashboardInputClass} placeholder="Content title" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Date *</label>
                  <Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Time</label>
                  <Input type="time" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} className={dashboardInputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Content Type</label>
                  <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} className={dashboardSelectClass}>
                    {CONTENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={dashboardSelectClass}>
                    {CONTENT_CALENDAR_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={dashboardSelectClass}>
                    {CONTENT_CALENDAR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Platform</label>
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={dashboardSelectClass}>
                    <option value="">None</option>
                    {CONTENT_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={cn(dashboardInputClass, "resize-none")} placeholder="Brief description..." />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Tags <span className="text-white/20">(comma-separated)</span></label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={dashboardInputClass} placeholder="e.g. SEO, Product Launch" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Notes</label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={cn(dashboardInputClass, "resize-none")} placeholder="Internal notes..." />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl border-white/10 text-white/60" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} className="btn-gold rounded-xl font-bold text-luxury-black">{editingId ? "Save Changes" : "Add Entry"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
