"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, LayoutTemplate, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";
import { resolveTemplateListingDisplayName } from "@/lib/website/template-marketplace/display-name";
import type {
  WbTemplateMarketplaceSortDirection,
  WbTemplateMarketplaceSortField,
} from "@/lib/website/template-marketplace/types";
import {
  canSelectMarketplaceListing,
  canInstallMarketplaceListing,
  mapMarketplaceListingToListItem,
} from "@/lib/website/template-marketplace";
import {
  fetchTemplateMarketplaceCatalog,
  installTemplateMarketplaceListing,
  resolveMarketplaceListingThumbnail,
  type TemplateMarketplaceCatalogQuery,
  type TemplateMarketplaceCategoryDefinition,
} from "@/lib/website/template-marketplace/client";
import {
  mapListItemToStructureTemplateChoice,
  type WebsiteStructureTemplateChoice,
} from "@/lib/website/builder/template-catalog";
import { fetchBuilderTemplateRuntimeModel } from "@/lib/website/builder/template-runtime-client";
import { WbTemplateMarketplaceCard } from "@/components/dashboard/template-marketplace/wb-template-marketplace-card";
import { CATEGORY_GRADIENTS } from "@/components/dashboard/template-marketplace/marketplace-visuals";

type SortPreset = {
  id: string;
  field: WbTemplateMarketplaceSortField;
  direction: WbTemplateMarketplaceSortDirection;
};

const SORT_PRESETS: SortPreset[] = [
  { id: "featured", field: "featured", direction: "desc" },
  { id: "name-asc", field: "name", direction: "asc" },
  { id: "name-desc", field: "name", direction: "desc" },
  { id: "released-desc", field: "releasedAt", direction: "desc" },
  { id: "category-asc", field: "category", direction: "asc" },
];

export type WbTemplateMarketplaceCatalogProps = {
  compact?: boolean;
  showHeader?: boolean;
  showFeaturedSection?: boolean;
  showFilters?: boolean;
  selectedId?: string | null;
  disabled?: boolean;
  availabilityFilter?: TemplateMarketplaceCatalogQuery["availability"];
  onSelect?: (choice: WebsiteStructureTemplateChoice) => void;
  buildUseHref?: (listing: WbTemplateMarketplaceListing) => string;
};

export function WbTemplateMarketplaceCatalog({
  compact = false,
  showHeader = false,
  showFeaturedSection = true,
  showFilters = true,
  selectedId,
  disabled = false,
  availabilityFilter = "all",
  onSelect,
  buildUseHref,
}: WbTemplateMarketplaceCatalogProps) {
  const pt = useProductT("templateMarketplace");
  const wb = useProductT("websiteBuilder");
  const { locale } = useTranslation();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availability, setAvailability] = useState<
    TemplateMarketplaceCatalogQuery["availability"]
  >(availabilityFilter);
  const [sortPresetId, setSortPresetId] = useState("featured");
  const [listings, setListings] = useState<WbTemplateMarketplaceListing[]>([]);
  const [categories, setCategories] = useState<
    TemplateMarketplaceCategoryDefinition[]
  >([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [previewListing, setPreviewListing] =
    useState<WbTemplateMarketplaceListing | null>(null);

  const sortPreset =
    SORT_PRESETS.find((preset) => preset.id === sortPresetId) ?? SORT_PRESETS[0];

  const categoryLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of categories) {
      map.set(item.id, item.label);
    }
    return map;
  }, [categories]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTemplateMarketplaceCatalog({
        q: query,
        category,
        tags: selectedTags,
        availability: showFilters ? availability : availabilityFilter,
        sort: sortPreset.field,
        direction: sortPreset.direction,
      });

      if (!data) {
        setListings([]);
        setCategories([]);
        setAvailableTags([]);
        setTotal(0);
        return;
      }

      setListings(data.listings);
      setCategories(data.categories);
      setAvailableTags(data.tags);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [
    query,
    category,
    selectedTags,
    availability,
    availabilityFilter,
    showFilters,
    sortPreset.field,
    sortPreset.direction,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCatalog();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [loadCatalog]);

  const featuredListings = useMemo(
    () => listings.filter((listing) => listing.featured),
    [listings],
  );

  const libraryListings = useMemo(() => {
    if (!showFeaturedSection || featuredListings.length === 0) {
      return listings;
    }
    const featuredIds = new Set(featuredListings.map((listing) => listing.id));
    return listings.filter((listing) => !featuredIds.has(listing.id));
  }, [listings, featuredListings, showFeaturedSection]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    );
  };

  const handleInstall = async (listing: WbTemplateMarketplaceListing) => {
    if (disabled || installingId) return;

    setInstallingId(listing.id);
    try {
      const result = await installTemplateMarketplaceListing(listing.id);
      if (!result.ok || !result.listing) {
        toast.error(result.message ?? pt("errors.installFailed"));
        return;
      }

      toast.success(
        result.alreadyInstalled
          ? pt("installAlreadyDone", {
              name: resolveTemplateListingDisplayName(result.listing, locale),
            })
          : pt("installSuccess", {
              name: resolveTemplateListingDisplayName(result.listing, locale),
            }),
      );
      await loadCatalog();

      if (onSelect && canSelectMarketplaceListing(result.listing)) {
        await handleSelect(result.listing);
      }
    } finally {
      setInstallingId(null);
    }
  };

  const handleSelect = async (listing: WbTemplateMarketplaceListing) => {
    if (!onSelect || disabled) return;

    if (!canSelectMarketplaceListing(listing)) {
      toast.message(pt("remoteOnlyHint"));
      return;
    }

    setSelectingId(listing.id);
    try {
      const runtime = await fetchBuilderTemplateRuntimeModel(listing.id);
      const components =
        runtime.ok && runtime.model.regions.main
          ? [...runtime.model.regions.main.placement.allowedComponentTypes]
          : [];

      onSelect(
        mapListItemToStructureTemplateChoice(
          mapMarketplaceListingToListItem(listing),
          components,
        ),
      );
    } finally {
      setSelectingId(null);
    }
  };

  const defaultUseHref = (listing: WbTemplateMarketplaceListing) =>
    `/dashboard/website-builder?templateId=${encodeURIComponent(listing.id)}`;

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-black/20 p-6">
        <Loader2 className="size-5 animate-spin text-white/40" />
      </div>
    );
  }

  if (!loading && listings.length === 0) {
    return (
      <TemplatesPlaceholder
        compact={compact}
        onCreate={() => toast.message(pt("createUnavailable"))}
      />
    );
  }

  if (compact) {
    return (
      <>
        <div className="space-y-2">
          {listings.map((listing) => (
            <WbTemplateMarketplaceCard
              key={listing.id}
              listing={listing}
              compact
              selected={selectedId === listing.id}
              busy={selectingId === listing.id}
              installing={installingId === listing.id}
              disabled={disabled}
              onSelect={() => void handleSelect(listing)}
              onInstall={() => void handleInstall(listing)}
              onPreview={() => setPreviewListing(listing)}
            />
          ))}
        </div>
        <ListingPreviewDialog
          listing={previewListing}
          categoryLabel={
            previewListing
              ? categoryLabels.get(previewListing.category)
              : undefined
          }
          onOpenChange={(open) => {
            if (!open) setPreviewListing(null);
          }}
          buildUseHref={buildUseHref ?? defaultUseHref}
          onUseListing={
            onSelect
              ? (listing) => {
                  void handleSelect(listing);
                  setPreviewListing(null);
                }
              : undefined
          }
          onInstallListing={(listing) => {
            void handleInstall(listing);
          }}
          installingId={installingId}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader ? (
        <div>
          <p className="text-[12px] font-semibold tracking-wide text-white/45 uppercase">
            {wb("panels.structureTemplatesTitle")}
          </p>
          <p className="text-[11px] text-white/35">
            {wb("panels.structureTemplatesSubtitle")}
          </p>
        </div>
      ) : null}

      {showFilters ? (
        <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={pt("searchPlaceholder")}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
            >
              <option value="all">{pt("allCategories")}</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={availability ?? "all"}
              onChange={(event) =>
                setAvailability(
                  event.target.value as TemplateMarketplaceCatalogQuery["availability"],
                )
              }
              className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
            >
              <option value="all">{pt("allAvailability")}</option>
              <option value="installed">{pt("installedOnly")}</option>
              <option value="remote">{pt("remoteOnlyFilter")}</option>
            </select>
            <select
              value={sortPresetId}
              onChange={(event) => setSortPresetId(event.target.value)}
              className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
            >
              {SORT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {pt(`sort.${preset.id}`)}
                </option>
              ))}
            </select>
          </div>

          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <span className="self-center text-[11px] font-medium text-white/40">
                {pt("tagsFilter")}
              </span>
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                      active
                        ? "bg-premium-gold text-black"
                        : "bg-white/10 text-white/55 hover:bg-white/15",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {showFeaturedSection && featuredListings.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-premium-gold/90">
            {pt("featuredSection")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredListings.map((listing) => (
              <WbTemplateMarketplaceCard
                key={`featured-${listing.id}`}
                listing={listing}
                categoryLabel={categoryLabels.get(listing.category)}
                highlighted
                selected={selectedId === listing.id}
                busy={selectingId === listing.id}
                installing={installingId === listing.id}
                disabled={disabled}
                onSelect={
                  onSelect ? () => void handleSelect(listing) : undefined
                }
                onInstall={() => void handleInstall(listing)}
                useHref={
                  !onSelect
                    ? (buildUseHref ?? defaultUseHref)(listing)
                    : undefined
                }
                onPreview={() => setPreviewListing(listing)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80">
            {pt("library")} ({total})
          </h3>
          {loading ? (
            <Loader2 className="size-4 animate-spin text-white/35" />
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {libraryListings.map((listing) => (
            <WbTemplateMarketplaceCard
              key={listing.id}
              listing={listing}
              categoryLabel={categoryLabels.get(listing.category)}
              highlighted={listing.featured}
              selected={selectedId === listing.id}
              busy={selectingId === listing.id}
              installing={installingId === listing.id}
              disabled={disabled}
              onSelect={onSelect ? () => void handleSelect(listing) : undefined}
              onInstall={() => void handleInstall(listing)}
              useHref={
                !onSelect ? (buildUseHref ?? defaultUseHref)(listing) : undefined
              }
              onPreview={() => setPreviewListing(listing)}
            />
          ))}
        </div>
      </section>

      <ListingPreviewDialog
        listing={previewListing}
        categoryLabel={
          previewListing
            ? categoryLabels.get(previewListing.category)
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) setPreviewListing(null);
        }}
        buildUseHref={buildUseHref ?? defaultUseHref}
        onUseListing={
          onSelect
            ? (listing) => {
                void handleSelect(listing);
                setPreviewListing(null);
              }
            : undefined
        }
        onInstallListing={(listing) => {
          void handleInstall(listing);
        }}
        installingId={installingId}
      />
    </div>
  );
}

function ListingPreviewDialog({
  listing,
  categoryLabel,
  onOpenChange,
  buildUseHref,
  onUseListing,
  onInstallListing,
  installingId,
}: {
  listing: WbTemplateMarketplaceListing | null;
  categoryLabel?: string;
  onOpenChange: (open: boolean) => void;
  buildUseHref: (listing: WbTemplateMarketplaceListing) => string;
  onUseListing?: (listing: WbTemplateMarketplaceListing) => void;
  onInstallListing?: (listing: WbTemplateMarketplaceListing) => void;
  installingId?: string | null;
}) {
  const pt = useProductT("templateMarketplace");
  const { locale } = useTranslation();
  const open = Boolean(listing);
  const displayName = listing
    ? resolveTemplateListingDisplayName(listing, locale)
    : "";
  const thumbnail = listing ? resolveMarketplaceListingThumbnail(listing) : null;
  const gradient = listing
    ? (CATEGORY_GRADIENTS[listing.category] ?? CATEGORY_GRADIENTS.other)
    : CATEGORY_GRADIENTS.other;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden border-white/10 bg-[#0c0c0c] text-white">
        {listing ? (
          <>
            <DialogHeader>
              <DialogTitle>{displayName}</DialogTitle>
              <DialogDescription className="text-white/45">
                {listing.description}
              </DialogDescription>
            </DialogHeader>

            <div className="relative h-48 overflow-hidden rounded-xl border border-white/10">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={displayName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                  }}
                />
              )}
            </div>

            <div className="grid gap-3 text-[12px] text-white/55 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-white/80">{pt("details")}</p>
                <p>
                  {pt("categoryLabel", {
                    category: categoryLabel ?? listing.category,
                  })}
                </p>
                <p>{pt("layoutLabel", { type: listing.layout })}</p>
                <p>
                  {pt("regionsPages", {
                    regions: listing.regionCount,
                    pages: listing.pageCount,
                  })}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white/80">{pt("metadataSection")}</p>
                <p>
                  {listing.metadata.author.organization ??
                    listing.metadata.author.name}
                </p>
                <p>{listing.tags.join(" · ")}</p>
              </div>
            </div>

            {canSelectMarketplaceListing(listing) ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                {onUseListing ? (
                  <Button
                    type="button"
                    className="flex-1 gap-1.5 bg-premium-gold font-semibold text-luxury-black hover:bg-premium-gold/90"
                    onClick={() => onUseListing(listing)}
                  >
                    <LayoutTemplate className="size-4" />
                    {pt("useThisTemplate")}
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="flex-1 gap-1.5 bg-premium-gold font-semibold text-luxury-black hover:bg-premium-gold/90"
                  >
                    <a href={buildUseHref(listing)}>
                      <LayoutTemplate className="size-4" />
                      {pt("useThisTemplate")}
                    </a>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-1.5 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => onOpenChange(false)}
                >
                  {pt("close")}
                </Button>
              </div>
            ) : listing.availability === "unavailable" ? (
              <div className="space-y-3">
                <p className="text-center text-[12px] font-medium text-amber-200/90">
                  {pt("installComingSoon")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-1.5 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => onOpenChange(false)}
                >
                  {pt("close")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-[12px] font-medium text-amber-200/90">
                  {pt("installToUse")}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={
                      !onInstallListing ||
                      installingId === listing.id ||
                      !canInstallMarketplaceListing(listing)
                    }
                    className="flex-1 gap-1.5 border border-dashed border-white/20 bg-white/[0.06] font-semibold text-white opacity-100 disabled:opacity-70"
                    onClick={() => onInstallListing?.(listing)}
                  >
                    {installingId === listing.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    {pt("install")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-1.5 border-white/20 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => onOpenChange(false)}
                  >
                    {pt("close")}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TemplatesPlaceholder({
  compact = false,
  onCreate,
}: {
  compact?: boolean;
  onCreate: () => void;
}) {
  const pt = useProductT("templateMarketplace");

  if (compact) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-black/20 p-4 text-center">
        <LayoutTemplate className="mx-auto size-5 text-white/30" />
        <p className="mt-2 text-sm font-semibold text-white/80">
          {pt("title")}
        </p>
        <p className="mt-1 text-[11px] text-white/40">{pt("noResults")}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="btn-ghost-gold mt-3 w-full rounded-xl text-xs"
          onClick={onCreate}
        >
          <Plus className="size-3.5" />
          {pt("createFirst")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/[0.12] bg-black/20 p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <LayoutTemplate className="size-5 text-premium-gold/80" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{pt("title")}</h3>
      <p className="mt-2 text-sm text-white/45">{pt("noResults")}</p>
      <Button
        type="button"
        className="btn-gold mt-5 rounded-xl font-semibold text-luxury-black"
        onClick={onCreate}
      >
        <Plus className="size-4" />
        {pt("createFirst")}
      </Button>
    </div>
  );
}
