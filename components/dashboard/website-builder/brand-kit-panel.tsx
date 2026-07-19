"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BrandKitOption = {
  id: string;
  name: string;
  primary?: string;
  secondary?: string;
  accent?: string;
};

export function BrandKitPanel(props: {
  selectedId?: string | null;
  disabled?: boolean;
  onSelect: (kit: BrandKitOption | null) => void;
}) {
  const [kits, setKits] = useState<BrandKitOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand-identity");
      if (!res.ok) throw new Error("Failed to load brand kits");
      const data = (await res.json()) as {
        generations?: Array<{
          id: string;
          brand_name?: string;
          blueprint?: {
            colorPalette?: Array<{ hex?: string; value?: string; name?: string } | string>;
          } | null;
        }>;
      };
      const rows = (data.generations || []).slice(0, 12).map((g) => {
        const palette = (g.blueprint?.colorPalette || []).map((c) =>
          typeof c === "string" ? c : c.hex || c.value || "",
        );
        return {
          id: g.id,
          name: g.brand_name || "Brand Kit",
          primary: palette[0],
          secondary: palette[1],
          accent: palette[2],
        } satisfies BrandKitOption;
      });
      setKits(rows);
    } catch {
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold tracking-wide text-white/45 uppercase">
            Brand Kit
          </p>
          <p className="text-[11px] text-white/35">
            Apply logo colors & fonts from Brand Identity
          </p>
        </div>
        {props.selectedId ? (
          <Button
            size="sm"
            variant="outline"
            className="border-white/15 text-white"
            disabled={props.disabled}
            onClick={() => props.onSelect(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[12px] text-white/40">
          <Loader2 className="size-3.5 animate-spin" />
          Loading brand kits…
        </div>
      ) : kits.length === 0 ? (
        <p className="text-[12px] text-white/40">
          No brand kits yet. Create one in Brand Identity, then attach it here.
        </p>
      ) : (
        <div className="grid gap-2">
          {kits.map((kit) => (
            <button
              key={kit.id}
              type="button"
              disabled={props.disabled}
              onClick={() => props.onSelect(kit)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                props.selectedId === kit.id
                  ? "border-premium-gold/40 bg-premium-gold/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-premium-gold/25",
              )}
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
                <Palette className="size-4 text-premium-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">
                  {kit.name}
                </p>
                <div className="mt-1 flex gap-1">
                  {[kit.primary, kit.secondary, kit.accent]
                    .filter(Boolean)
                    .map((c) => (
                      <span
                        key={c}
                        className="size-3 rounded-full border border-white/20"
                        style={{ background: c }}
                      />
                    ))}
                </div>
              </div>
              {props.selectedId === kit.id ? (
                <Check className="size-3.5 text-premium-gold" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
