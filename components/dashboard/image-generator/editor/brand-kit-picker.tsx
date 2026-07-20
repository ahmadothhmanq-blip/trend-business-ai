"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandKitOption } from "@/lib/ai-core/image-design-platform/brand-kit";
import { brandKitFromGenerationRow } from "@/lib/ai-core/image-design-platform/brand-kit";

export function BrandKitPicker(props: {
  selectedId?: string | null;
  onSelect: (kit: BrandKitOption | null) => void;
  onApply: (kit: BrandKitOption) => void;
}) {
  const [kits, setKits] = useState<BrandKitOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand-identity");
      if (!res.ok) throw new Error("Failed to load brand kits");
      const data = (await res.json()) as {
        generations?: Array<{ id: string; brand_name?: string; blueprint?: unknown }>;
      };
      setKits((data.generations ?? []).slice(0, 12).map(brandKitFromGenerationRow));
    } catch {
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Loader2 className="size-3 animate-spin" /> Loading brand kits…
      </div>
    );
  }

  if (!kits.length) {
    return <p className="text-xs text-white/40">No brand kits found. Create one in Brand Studio first.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Brand Studio Kits</p>
      <div className="grid gap-2">
        {kits.map((kit) => (
          <button
            key={kit.id}
            type="button"
            onClick={() => props.onSelect(kit)}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
              props.selectedId === kit.id ? "border-premium-gold/40 bg-premium-gold/10" : "border-white/10 hover:border-white/20",
            )}
          >
            <div className="flex gap-1">
              {[kit.primary, kit.secondary, kit.accent].filter(Boolean).map((c) => (
                <span key={c} className="size-4 rounded-full border border-white/10" style={{ background: c }} />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{kit.name}</p>
              <p className="truncate text-[10px] text-white/40">{kit.tagline || "Brand kit"}</p>
            </div>
            {props.selectedId === kit.id ? <Check className="size-3 text-premium-gold-light" /> : <Palette className="size-3 text-white/30" />}
          </button>
        ))}
      </div>
      {props.selectedId && (
        <Button
          size="sm"
          className="btn-gold w-full rounded-lg font-bold text-luxury-black"
          onClick={() => {
            const kit = kits.find((k) => k.id === props.selectedId);
            if (kit) props.onApply(kit);
          }}
        >
          Apply brand kit to canvas
        </Button>
      )}
    </div>
  );
}
