"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Cloud,
  Download,
  Eye,
  HardDrive,
  LayoutTemplate,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";
import { resolveTemplateListingDisplayName } from "@/lib/website/template-marketplace/display-name";
import {
  canSelectMarketplaceListing,
  canInstallMarketplaceListing,
} from "@/lib/website/template-marketplace";
import { resolveMarketplaceListingThumbnail } from "@/lib/website/template-marketplace/client";
import { CATEGORY_GRADIENTS } from "@/components/dashboard/template-marketplace/marketplace-visuals";

export type WbTemplateMarketplaceCardProps = {
  listing: WbTemplateMarketplaceListing;
  categoryLabel?: string;
  selected?: boolean;
  busy?: boolean;
  installing?: boolean;
  disabled?: boolean;
  compact?: boolean;
  highlighted?: boolean;
  onSelect?: () => void;
  onInstall?: () => void;
  useHref?: string;
  onPreview?: () => void;
};

const primaryActionClass =
  "flex-1 min-w-0 gap-1.5 bg-premium-gold font-semibold text-luxury-black hover:bg-premium-gold/90 dark:text-black";

const secondaryActionClass =
  "flex-1 min-w-0 gap-1.5 border-border bg-background font-semibold text-foreground hover:bg-muted dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

const disabledInstallClass =
  "flex-1 min-w-0 gap-1.5 border border-dashed border-border bg-muted/70 font-semibold text-muted-foreground opacity-100 disabled:cursor-not-allowed disabled:opacity-100 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/70";

export function WbTemplateMarketplaceCard({
  listing,
  categoryLabel,
  selected = false,
  busy = false,
  installing = false,
  disabled = false,
  compact = false,
  highlighted = false,
  onSelect,
  onInstall,
  useHref,
  onPreview,
}: WbTemplateMarketplaceCardProps) {
  const pt = useProductT("templateMarketplace");
  const { locale } = useTranslation();
  const displayName = resolveTemplateListingDisplayName(listing, locale);
  const selectable = canSelectMarketplaceListing(listing);
  const installable = canInstallMarketplaceListing(listing);
  const installed = listing.availability === "installed";
  const thumbnail = resolveMarketplaceListingThumbnail(listing);
  const authorName =
    listing.metadata.author.organization ?? listing.metadata.author.name;
  const gradient =
    CATEGORY_GRADIENTS[listing.category] ?? CATEGORY_GRADIENTS.other;

  if (compact) {
    const useDisabled =
      disabled || busy || !selectable || (!useHref && !onSelect);

    return (
      <div
        className={cn(
          "w-full rounded-xl border px-3 py-2.5 text-left transition-all",
          selected
            ? "border-premium-gold/40 bg-premium-gold/10"
            : "border-border bg-muted/30 dark:border-white/[0.08] dark:bg-white/[0.03]",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-semibold text-foreground dark:text-white">
                {displayName}
              </p>
              {listing.featured ? (
                <Star className="size-3 shrink-0 fill-premium-gold text-premium-gold" />
              ) : null}
            </div>
            <p className="truncate text-[11px] text-muted-foreground dark:text-white/50">
              {listing.layout}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <AvailabilityBadge availability={listing.availability} compact />
            {busy ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground dark:text-white/60" />
            ) : selected ? (
              <Check className="size-3.5 text-premium-gold" />
            ) : (
              <LayoutTemplate className="size-3.5 text-muted-foreground dark:text-white/35" />
            )}
          </div>
        </div>

        <div className="mt-2 flex gap-1.5">
          {installed ? (
            useHref && selectable ? (
              <Button asChild size="sm" className={cn(primaryActionClass, "h-8 text-xs")}>
                <Link href={useHref}>
                  <LayoutTemplate className="size-3" />
                  {pt("use")}
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className={cn(primaryActionClass, "h-8 text-xs")}
                disabled={useDisabled}
                onClick={onSelect}
              >
                {busy ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <LayoutTemplate className="size-3" />
                )}
                {pt("use")}
              </Button>
            )
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled || installing || !onInstall || !installable}
              className={cn(
                "flex-1 min-w-0 gap-1.5 border border-dashed border-border bg-muted/70 font-semibold text-foreground opacity-100 disabled:cursor-not-allowed dark:border-white/15 dark:bg-white/[0.06] dark:text-white",
                "h-8 text-xs",
              )}
              onClick={onInstall}
            >
              {installing ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Download className="size-3" />
              )}
              {pt("install")}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(secondaryActionClass, "h-8 text-xs")}
            onClick={onPreview}
            disabled={!onPreview}
            title={pt("preview")}
          >
            <Eye className="size-3" />
            {pt("preview")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardPanel
      className={cn(
        "flex h-full flex-col overflow-hidden p-0 transition-all",
        highlighted || listing.featured
          ? "border-premium-gold/35 ring-1 ring-premium-gold/20"
          : "border-border dark:border-white/[0.08]",
        selected && "border-premium-gold/45 bg-premium-gold/5",
      )}
    >
      <div className="relative h-32 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-premium-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
              <Sparkles className="size-3" />
              {pt("featured")}
            </span>
          ) : null}
          <AvailabilityBadge availability={listing.availability} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {categoryLabel ?? listing.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-[15px] font-bold text-white">{displayName}</h4>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/60">
          {listing.description}
        </p>

        <p className="mt-2 text-[11px] text-white/50">
          {pt("authorLabel", { author: authorName })}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {listing.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>

        <ul className="mt-3 space-y-1 text-[11px] text-white/50">
          <li>{pt("layoutLabel", { type: listing.layout })}</li>
          <li>
            {pt("regionsPages", {
              regions: listing.regionCount,
              pages: listing.pageCount,
            })}
          </li>
        </ul>

        <TemplateCardActions
          installed={installed}
          selectable={selectable}
          busy={busy}
          installing={installing}
          disabled={disabled}
          useHref={useHref}
          onSelect={onSelect}
          onInstall={onInstall}
          onPreview={onPreview}
        />
      </div>
    </DashboardPanel>
  );
}

function TemplateCardActions({
  installed,
  selectable,
  busy,
  installing = false,
  disabled,
  useHref,
  onSelect,
  onInstall,
  onPreview,
}: {
  installed: boolean;
  selectable: boolean;
  busy: boolean;
  installing?: boolean;
  disabled: boolean;
  useHref?: string;
  onSelect?: () => void;
  onInstall?: () => void;
  onPreview?: () => void;
}) {
  const pt = useProductT("templateMarketplace");

  const useDisabled =
    disabled || busy || !selectable || (!useHref && !onSelect);

  return (
    <div className="mt-auto border-t border-border/70 pt-4 dark:border-white/10">
      {!installed ? (
        <p className="mb-2.5 text-center text-[11px] font-medium text-amber-700 dark:text-amber-200/90">
          {pt("installToUse")}
        </p>
      ) : null}

      <div className="flex gap-2">
        {installed ? (
          useHref && selectable ? (
            <Button asChild size="sm" className={primaryActionClass}>
              <Link href={useHref}>
                <LayoutTemplate className="size-3.5" />
                {pt("use")}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className={primaryActionClass}
              disabled={useDisabled}
              onClick={onSelect}
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <LayoutTemplate className="size-3.5" />
              )}
              {pt("use")}
            </Button>
          )
        ) : (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || installing || !onInstall}
            className={disabledInstallClass}
            onClick={onInstall}
          >
            {installing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {pt("install")}
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          className={secondaryActionClass}
          onClick={onPreview}
          disabled={!onPreview}
          title={pt("preview")}
        >
          <Eye className="size-3.5" />
          {pt("preview")}
        </Button>
      </div>
    </div>
  );
}

function AvailabilityBadge({
  availability,
  compact = false,
}: {
  availability: WbTemplateMarketplaceListing["availability"];
  compact?: boolean;
}) {
  const pt = useProductT("templateMarketplace");
  const installed = availability === "installed";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        installed
          ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200"
          : availability === "unavailable"
            ? "bg-amber-500/15 text-amber-900 dark:text-amber-200"
            : "bg-sky-500/15 text-sky-800 dark:text-sky-200",
        compact && "px-1.5 py-0 text-[9px]",
      )}
    >
      {installed ? (
        <HardDrive className={cn("size-3", compact && "size-2.5")} />
      ) : availability === "unavailable" ? (
        <LayoutTemplate className={cn("size-3 opacity-50", compact && "size-2.5")} />
      ) : (
        <Cloud className={cn("size-3", compact && "size-2.5")} />
      )}
      {installed
        ? pt("installed")
        : availability === "unavailable"
          ? pt("unavailable")
          : pt("notInstalled")}
    </span>
  );
}
