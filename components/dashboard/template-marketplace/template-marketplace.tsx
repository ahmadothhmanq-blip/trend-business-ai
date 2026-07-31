"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { WbTemplateMarketplaceCatalog } from "@/components/dashboard/template-marketplace/wb-template-marketplace-catalog";
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";

const ACTIVE_GENERATION_STORAGE_KEY = "wb-active-generation-id";

export function TemplateMarketplace() {
  const pt = useProductT("templateMarketplace");
  const wb = useProductT("websiteBuilder");
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("generation")?.trim() || null;
    const fromStorage =
      sessionStorage.getItem(ACTIVE_GENERATION_STORAGE_KEY)?.trim() || null;
    setActiveGenerationId(fromUrl || fromStorage);
  }, []);

  const buildUseHref = useCallback(
    (listing: WbTemplateMarketplaceListing) => {
      const params = new URLSearchParams();
      params.set("templateId", listing.id);
      params.set("applyTemplate", "1");
      if (activeGenerationId) {
        params.set("generation", activeGenerationId);
      }
      return `/dashboard/website-builder?${params.toString()}`;
    },
    [activeGenerationId],
  );

  const backHref = activeGenerationId
    ? `/dashboard/website-builder?generation=${encodeURIComponent(activeGenerationId)}`
    : "/dashboard/website-builder";

  return (
    <div className="space-y-8">
      <DashboardPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
              <Sparkles className="size-3" />
              {pt("badge")}
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {pt("title")}
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-white/45">
              {pt("description")}
            </p>
          </div>
          <Link href="/dashboard/website-builder">
            <Button
              variant="outline"
              className="btn-ghost-gold border-premium-gold/30 font-semibold text-white"
            >
              {pt("openWebsiteBuilder")}
            </Button>
          </Link>
        </div>
      </DashboardPanel>

      <div className="mb-2">
        <Button asChild variant="outline" className="btn-ghost-gold rounded-xl">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {wb("settings.backToWorkspace")}
          </Link>
        </Button>
      </div>

      <WbTemplateMarketplaceCatalog
        showFilters
        showFeaturedSection
        buildUseHref={buildUseHref}
      />
    </div>
  );
}
