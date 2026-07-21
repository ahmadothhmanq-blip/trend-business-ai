"use client";

import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { applyTemplateVariables } from "@/lib/content-studio/templates";
import type { ContentTemplate, ContentTemplateVariable } from "@/types/content";

type Props = {
  onSelect: (payload: {
    template: ContentTemplate;
    prompt: string;
    contentTool: string;
    contentType: string;
  }) => void;
};

export function ContentTemplatesPanel({ onSelect }: Props) {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState<ContentTemplate | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (loaded) return;
    const res = await fetch("/api/content-studio/templates");
    const data = await res.json();
    setTemplates(data.templates ?? []);
    setCategories(data.categories ?? []);
    setLoaded(true);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = templates.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

  const openTemplate = (t: ContentTemplate) => {
    setActive(t);
    const defaults: Record<string, string> = {};
    for (const v of t.variables ?? []) {
      if (v.default) defaults[v.key] = v.default;
    }
    setValues(defaults);
  };

  const useTemplate = () => {
    if (!active) return;
    const prompt = applyTemplateVariables(
      active.prompt_structure,
      values,
      active.variables as ContentTemplateVariable[],
    );
    onSelect({
      template: active,
      prompt,
      contentTool: active.content_tool,
      contentType: active.content_type,
    });
    setActive(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="rounded-xl border-white/10 bg-white/5 pl-9 text-white"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/70"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => openTemplate(t)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-premium-gold/30 hover:bg-white/[0.04]"
          >
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-5 shrink-0 text-premium-gold" />
              <div>
                <p className="font-medium text-white">{t.name}</p>
                <p className="mt-1 text-xs text-premium-gold/80">{t.category}</p>
                <p className="mt-2 line-clamp-2 text-sm text-white/50">{t.preview || t.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-xl border border-premium-gold/20 bg-premium-gold/5 p-4">
          <p className="font-medium text-white">{active.name}</p>
          <p className="mt-1 text-sm text-white/50">{active.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(active.variables as ContentTemplateVariable[]).map((v) => (
              <div key={v.key}>
                <label className="text-xs text-white/50">{v.label}</label>
                <Input
                  value={values[v.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v.key]: e.target.value }))}
                  placeholder={v.placeholder}
                  className="mt-1 rounded-lg border-white/10 bg-white/5 text-white"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={useTemplate}
              className="rounded-lg bg-premium-gold/20 px-4 py-2 text-sm font-medium text-premium-gold-light"
            >
              Use Template
            </button>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="rounded-lg px-4 py-2 text-sm text-white/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
