"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SocialTemplate } from "@/lib/social-media/templates";
import type { SocialPostPlatform } from "@/types/social-media";

type Props = {
  platform: SocialPostPlatform;
  onApply: (payload: { template: SocialTemplate; topic: string }) => void;
};

export function TemplateSelector({ platform, onApply }: Props) {
  const [templates, setTemplates] = useState<SocialTemplate[]>([]);
  const [active, setActive] = useState<SocialTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    void fetch(`/api/social-media/templates?platform=${platform}`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
  }, [platform]);

  const open = (t: SocialTemplate) => {
    setActive(t);
    const defaults: Record<string, string> = {};
    for (const v of t.variables) if (v.default) defaults[v.key] = v.default;
    setValues(defaults);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">Templates</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => open(t)}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-left hover:border-premium-gold/30"
          >
            <p className="text-sm font-medium text-white">{t.name}</p>
            <p className="text-xs text-white/40">{t.category}</p>
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-lg border border-premium-gold/20 bg-premium-gold/5 p-3">
          <p className="text-sm text-white">{active.name}</p>
          <p className="mt-1 text-xs text-white/50">{active.preview}</p>
          <div className="mt-3 space-y-2">
            {active.variables.map((v) => (
              <div key={v.key}>
                <label className="text-xs text-white/50">{v.label}</label>
                <Input
                  value={values[v.key] ?? ""}
                  onChange={(e) => setValues((p) => ({ ...p, [v.key]: e.target.value }))}
                  placeholder={v.placeholder}
                  className="mt-1 h-8 rounded-lg border-white/10 bg-white/5 text-sm text-white"
                />
              </div>
            ))}
          </div>
          <Button
            size="sm"
            className="mt-3 rounded-lg"
            onClick={() => {
              const topic = active.variables
                .map((v) => `${v.label}: ${values[v.key] || v.default || ""}`)
                .join(". ");
              onApply({ template: active, topic });
              setActive(null);
            }}
          >
            Use Template
          </Button>
        </div>
      )}
    </div>
  );
}
