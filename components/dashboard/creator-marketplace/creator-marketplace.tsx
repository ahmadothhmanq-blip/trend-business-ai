"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Heart,
  LayoutTemplate,
  Loader2,
  Monitor,
  Plus,
  Smartphone,
  Star,
  Tablet,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";
import {
  CREATOR_MARKETPLACE_CATEGORIES,
  type CreatorMarketplaceCategory,
  type CreatorTemplateListing,
  type MarketplaceCreatorProfile,
} from "@/lib/marketplace/templates";

type CatalogResponse = {
  listings: CreatorTemplateListing[];
  categories: Array<{ id: CreatorMarketplaceCategory; label: string }>;
  styles: string[];
  creators: MarketplaceCreatorProfile[];
  count: number;
};

type DetailResponse = {
  listing: CreatorTemplateListing;
  previewHtml: string;
  builderHref?: string;
};

type CreatorMeResponse = {
  profile: MarketplaceCreatorProfile;
  listings: CreatorTemplateListing[];
  count: number;
};

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function CreatorMarketplace() {
  const pt = useProductT("creatorMarketplace");
  const { formatCurrency } = useFormatter();
  const formatListingPrice = (cents: number) =>
    cents <= 0 ? pt("free") : formatCurrency(cents);
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CreatorMarketplaceCategory | "all">(
    "all",
  );
  const [style, setStyle] = useState<string>("all");
  const [price, setPrice] = useState<"all" | "free" | "paid">("all");
  const [sort, setSort] = useState("popular");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [preview, setPreview] = useState<DetailResponse | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [usingId, setUsingId] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorMe, setCreatorMe] = useState<CreatorMeResponse | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (style !== "all") params.set("style", style);
      if (price !== "all") params.set("price", price);
      if (sort) params.set("sort", sort);
      if (query.trim()) params.set("q", query.trim());
      if (favoritesOnly) params.set("favorites", "1");
      const res = await fetch(`/api/marketplace/templates?${params}`);
      if (!res.ok) throw new Error(pt("errors.loadFailed"));
      const data = (await res.json()) as CatalogResponse;
      setCatalog(data);
    } catch {
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, [category, style, price, sort, query, favoritesOnly]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadCatalog();
    }, 120);
    return () => clearTimeout(t);
  }, [loadCatalog]);

  const openPreview = async (id: string) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    setViewport("desktop");
    try {
      const res = await fetch(
        `/api/marketplace/templates/${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw new Error(pt("errors.previewFailed"));
      const data = (await res.json()) as DetailResponse;
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const toggleFavorite = async (listing: CreatorTemplateListing) => {
    const res = await fetch(
      `/api/marketplace/templates/${encodeURIComponent(listing.id)}/favorite`,
      { method: "POST" },
    );
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) return;
    void loadCatalog();
    if (preview?.listing.id === listing.id) {
      const fav = (await res.json()) as { favorited: boolean };
      setPreview({
        ...preview,
        listing: { ...preview.listing, favorited: fav.favorited },
      });
    }
  };

  const applyListingTemplate = async (listingId: string) => {
    setUsingId(listingId);
    try {
      const res = await fetch(
        `/api/marketplace/templates/${encodeURIComponent(listingId)}/use`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(pt("errors.useFailed"));
      const data = (await res.json()) as { builderHref: string };
      router.push(data.builderHref);
    } catch {
      setUsingId(null);
    }
  };

  const openCreator = async () => {
    setCreatorOpen(true);
    setCreatorLoading(true);
    try {
      const res = await fetch("/api/marketplace/creators/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setCreatorMe((await res.json()) as CreatorMeResponse);
    } catch {
      setCreatorMe(null);
    } finally {
      setCreatorLoading(false);
    }
  };

  const listings = catalog?.listings ?? [];
  const categories =
    catalog?.categories?.length
      ? catalog.categories
      : CREATOR_MARKETPLACE_CATEGORIES;
  const styles = catalog?.styles?.length
    ? catalog.styles
    : [
        "luxury",
        "modern",
        "corporate",
        "creative",
        "minimal",
        "premium-saas",
        "technology",
      ];

  const featured = useMemo(
    () =>
      [...listings]
        .sort((a, b) => b.analytics.uses - a.analytics.uses)
        .slice(0, 4),
    [listings],
  );

  return (
    <div className="space-y-8">
      <DashboardPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
              <LayoutTemplate className="size-3" />
              {pt("badge")}
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {pt("title")}
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-white/45">
              {pt("description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/15 text-white"
              onClick={() => void openCreator()}
            >
              <UserRound className="size-4" />
              {pt("creatorProfile")}
            </Button>
            <Button
              className="bg-premium-gold text-black hover:bg-premium-gold/90"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="size-4" />
              {pt("uploadTemplate")}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pt("searchPlaceholder")}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 lg:col-span-2"
          />
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as CreatorMarketplaceCategory | "all")
            }
            className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
          >
            <option value="all">{pt("allIndustries")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
          >
            <option value="all">{pt("allStyles")}</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={price}
            onChange={(e) =>
              setPrice(e.target.value as "all" | "free" | "paid")
            }
            className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
          >
            <option value="all">{pt("anyPrice")}</option>
            <option value="free">{pt("free")}</option>
            <option value="paid">{pt("paid")}</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
          >
            <option value="popular">{pt("sort.popular")}</option>
            <option value="newest">{pt("sort.newest")}</option>
            <option value="rating">{pt("sort.rating")}</option>
            <option value="price-asc">{pt("sort.priceAsc")}</option>
            <option value="price-desc">{pt("sort.priceDesc")}</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={favoritesOnly ? "default" : "outline"}
            className={cn(
              favoritesOnly
                ? "bg-premium-gold text-black"
                : "border-white/15 text-white",
            )}
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            <Heart className={cn("size-3.5", favoritesOnly && "fill-current")} />
            {pt("favorites")}
          </Button>
          <Link href="/dashboard/website-builder">
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
            >
              {pt("openWebsiteBuilder")}
            </Button>
          </Link>
        </div>
      </DashboardPanel>

      {featured.length > 0 && !favoritesOnly && !query ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            {pt("trending")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                using={usingId === l.id}
                onPreview={() => void openPreview(l.id)}
                onFavorite={() => void toggleFavorite(l)}
                onUse={() => void applyListingTemplate(l.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80">
            {pt("marketplace")} {catalog ? `(${catalog.count})` : ""}
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-16 text-white/40">
            <Loader2 className="size-4 animate-spin" />
            {pt("loading")}
          </div>
        ) : listings.length === 0 ? (
          <DashboardPanel className="p-8 text-center text-sm text-white/40">
            {pt("noResults")}
          </DashboardPanel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                using={usingId === l.id}
                onPreview={() => void openPreview(l.id)}
                onFavorite={() => void toggleFavorite(l)}
                onUse={() => void applyListingTemplate(l.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden border-white/10 bg-[#0c0c0c] text-white sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {preview?.listing.title || pt("previewTitle")}
            </DialogTitle>
            <DialogDescription className="text-white/45">
              {preview?.listing.description || pt("previewDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["desktop", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ] as const
            ).map(([key, Icon]) => (
              <Button
                key={key}
                size="sm"
                variant={viewport === key ? "default" : "outline"}
                className={cn(
                  viewport === key
                    ? "bg-premium-gold text-black"
                    : "border-white/15 text-white",
                )}
                onClick={() => setViewport(key)}
              >
                <Icon className="size-3.5" />
                {pt(`viewports.${key}`)}
              </Button>
            ))}
          </div>

          <div className="mt-3 flex justify-center overflow-auto rounded-xl border border-white/10 bg-[#080808] p-3">
            {previewLoading ? (
              <div className="flex h-[420px] items-center justify-center text-white/40">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : preview?.previewHtml ? (
              <iframe
                title={pt("previewIframe")}
                srcDoc={preview.previewHtml}
                className="h-[520px] rounded-lg border border-white/10 bg-white transition-all"
                style={{ width: VIEWPORT_WIDTH[viewport], maxWidth: "100%" }}
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center text-sm text-white/40">
                {pt("previewUnavailable")}
              </div>
            )}
          </div>

          {preview?.listing ? (
            <div className="grid gap-3 text-[12px] text-white/55 sm:grid-cols-4">
              <div>
                <p className="font-semibold text-white/80">{pt("author")}</p>
                <p>{preview.listing.author.displayName}</p>
                <p>@{preview.listing.author.handle}</p>
              </div>
              <div>
                <p className="font-semibold text-white/80">{pt("rating")}</p>
                <p>
                  {preview.listing.reviews.averageRating.toFixed(1)} ·{" "}
                  {pt("reviews", { count: preview.listing.reviews.reviewCount })}
                </p>
                <p>{formatListingPrice(preview.listing.commerce.priceCents)}</p>
              </div>
              <div>
                <p className="font-semibold text-white/80">{pt("version")}</p>
                <p>
                  {preview.listing.versions.find((v) => v.isLatest)?.version ||
                    "1.0.0"}
                </p>
                <p className="line-clamp-2">
                  {preview.listing.versions.find((v) => v.isLatest)
                    ?.changelog || "—"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white/80">{pt("features")}</p>
                <p className="line-clamp-3">
                  {preview.listing.features.join(" · ")}
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="border-white/15 text-white"
              disabled={!preview?.listing}
              onClick={() =>
                preview?.listing && void toggleFavorite(preview.listing)
              }
            >
              <Heart
                className={cn(
                  "size-4",
                  preview?.listing.favorited && "fill-premium-gold text-premium-gold",
                )}
              />
              {preview?.listing.favorited ? pt("favorited") : pt("favorite")}
            </Button>
            {preview?.listing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-white/15 text-white"
                  disabled={usingId === preview.listing.id}
                  onClick={() => void applyListingTemplate(preview.listing.id)}
                >
                  <Copy className="size-4" />
                  {pt("duplicate")}
                </Button>
                <Button
                  className="bg-premium-gold text-black hover:bg-premium-gold/90"
                  disabled={usingId === preview.listing.id}
                  onClick={() => void applyListingTemplate(preview.listing.id)}
                >
                  {usingId === preview.listing.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {pt("useTemplate")}
                </Button>
              </div>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UploadTemplateDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        categories={categories}
        styles={styles}
        onUploaded={() => {
          setUploadOpen(false);
          void loadCatalog();
        }}
      />

      <CreatorProfileDialog
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        loading={creatorLoading}
        data={creatorMe}
        onRefresh={() => void openCreator()}
        onPreview={(id) => void openPreview(id)}
      />
    </div>
  );
}

function ListingCard(props: {
  listing: CreatorTemplateListing;
  using: boolean;
  onPreview: () => void;
  onFavorite: () => void;
  onUse: () => void;
}) {
  const { listing: l, using, onPreview, onFavorite, onUse } = props;
  const pt = useProductT("creatorMarketplace");
  const { formatCurrency } = useFormatter();
  const formatListingPrice = (cents: number) =>
    cents <= 0 ? pt("free") : formatCurrency(cents);
  return (
    <DashboardPanel className="flex h-full flex-col overflow-hidden p-0">
      <button
        type="button"
        onClick={onPreview}
        className="relative h-32 w-full text-left"
        style={{
          background:
            l.previewImageUrl || l.previewGradient
              ? l.previewGradient
              : "linear-gradient(135deg,#111,#d4af37)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {l.category}
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90">
            {l.style}
          </span>
          <span className="rounded-full bg-premium-gold/90 px-2 py-0.5 text-[10px] font-semibold text-black">
            {formatListingPrice(l.commerce.priceCents)}
          </span>
        </div>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-[15px] font-bold text-white">{l.title}</h4>
            <p className="mt-0.5 text-[11px] text-white/40">
              {pt("byAuthor", { name: l.author.displayName })}
            </p>
          </div>
          <button
            type="button"
            onClick={onFavorite}
            className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-premium-gold"
            aria-label={pt("favoriteAria")}
          >
            <Heart
              className={cn(
                "size-4",
                l.favorited && "fill-premium-gold text-premium-gold",
              )}
            />
          </button>
        </div>
        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/45">
          {l.tagline}
        </p>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-premium-gold text-premium-gold" />
            {l.reviews.averageRating.toFixed(1)}
            <span className="text-white/30">({l.reviews.reviewCount})</span>
          </span>
          <span>v{l.versions.find((v) => v.isLatest)?.version || "1.0.0"}</span>
        </div>
        <ul className="mt-3 space-y-1 text-[11px] text-white/40">
          {l.features.slice(0, 3).map((f) => (
            <li key={f} className="line-clamp-1">
              · {f}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-white/15 text-white"
            onClick={onPreview}
          >
            {pt("livePreview")}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-premium-gold text-black hover:bg-premium-gold/90"
            disabled={using}
            onClick={onUse}
          >
            {using ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {pt("useTemplate")}
          </Button>
        </div>
      </div>
    </DashboardPanel>
  );
}

function UploadTemplateDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: CreatorMarketplaceCategory; label: string }>;
  styles: string[];
  onUploaded: () => void;
}) {
  const pt = useProductT("creatorMarketplace");
  const { t } = useTranslation();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<CreatorMarketplaceCategory>("saas");
  const [style, setStyle] = useState("modern");
  const [features, setFeatures] = useState("");
  const [priceCents, setPriceCents] = useState("0");
  const [version, setVersion] = useState("1.0.0");
  const [changelog, setChangelog] = useState(pt("upload.initialChangelog"));

  const reset = () => {
    setTitle("");
    setTagline("");
    setDescription("");
    setCategory("saas");
    setStyle("modern");
    setFeatures("");
    setPriceCents("0");
    setVersion("1.0.0");
    setChangelog(pt("upload.initialChangelog"));
    setError(null);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline: tagline || undefined,
          description,
          category,
          style,
          features: features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          priceCents: Math.max(0, Number(priceCents) || 0),
          priceModel: Number(priceCents) > 0 ? "paid" : "free",
          version,
          changelog,
          status: "published",
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || pt("upload.uploadFailed"));
      }
      reset();
      props.onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : pt("upload.uploadFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) reset();
        props.onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0c0c0c] text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{pt("upload.title")}</DialogTitle>
          <DialogDescription className="text-white/45">
            {pt("upload.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={pt("upload.titlePlaceholder")}
            className="border-white/10 bg-white/5 text-white"
          />
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder={pt("upload.taglinePlaceholder")}
            className="border-white/10 bg-white/5 text-white"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={pt("upload.descriptionPlaceholder")}
            className="min-h-[96px] border-white/10 bg-white/5 text-white"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as CreatorMarketplaceCategory)
              }
              className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
            >
              {props.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
            >
              {props.styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Input
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder={pt("upload.featuresPlaceholder")}
            className="border-white/10 bg-white/5 text-white"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              value={priceCents}
              onChange={(e) => setPriceCents(e.target.value)}
              placeholder={pt("upload.pricePlaceholder")}
              className="border-white/10 bg-white/5 text-white"
            />
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder={pt("upload.versionPlaceholder")}
              className="border-white/10 bg-white/5 text-white"
            />
            <Input
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder={pt("upload.changelogPlaceholder")}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          {error ? (
            <p className="text-[12px] text-red-400">{error}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-white/15 text-white"
            onClick={() => props.onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="bg-premium-gold text-black hover:bg-premium-gold/90"
            disabled={saving || title.trim().length < 3}
            onClick={() => void submit()}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {pt("upload.publishListing")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreatorProfileDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  data: CreatorMeResponse | null;
  onRefresh: () => void;
  onPreview: (id: string) => void;
}) {
  const pt = useProductT("creatorMarketplace");
  const { t } = useTranslation();
  const { formatCurrency } = useFormatter();
  const formatListingPrice = (cents: number) =>
    cents <= 0 ? pt("free") : formatCurrency(cents);
  const [versionListingId, setVersionListingId] = useState<string | null>(null);
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [savingVersion, setSavingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addVersion = async () => {
    if (!versionListingId) return;
    setSavingVersion(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/marketplace/templates/${encodeURIComponent(versionListingId)}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version, changelog }),
        },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || pt("creator.versionFailed"));
      }
      setVersionListingId(null);
      setVersion("");
      setChangelog("");
      props.onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : pt("creator.versionFailed"));
    } finally {
      setSavingVersion(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0c0c0c] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pt("creator.title")}</DialogTitle>
          <DialogDescription className="text-white/45">
            {pt("creator.description")}
          </DialogDescription>
        </DialogHeader>

        {props.loading ? (
          <div className="flex items-center gap-2 py-10 text-white/40">
            <Loader2 className="size-4 animate-spin" />
            {pt("creator.loading")}
          </div>
        ) : props.data ? (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div
                className="size-14 shrink-0 rounded-full"
                style={{ background: props.data.profile.avatarGradient }}
              />
              <div>
                <h3 className="text-lg font-bold text-white">
                  {props.data.profile.displayName}
                </h3>
                <p className="text-[12px] text-white/45">
                  @{props.data.profile.handle} ·{" "}
                  {pt("creator.templatesCount", { count: props.data.profile.templateCount })} ·{" "}
                  {pt("creator.payouts", {
                    status: props.data.profile.payoutReady
                      ? pt("creator.payoutsReady")
                      : pt("creator.payoutsPending"),
                  })}
                </p>
                <p className="mt-2 text-[13px] text-white/55">
                  {props.data.profile.bio}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-white/80">
                {pt("creator.yourListings", { count: props.data.count })}
              </h4>
              {props.data.listings.length === 0 ? (
                <p className="text-[12px] text-white/40">
                  {pt("creator.noUploads")}
                </p>
              ) : (
                <div className="space-y-2">
                  {props.data.listings.map((l) => (
                    <div
                      key={l.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-white">
                          {l.title}
                        </p>
                        <p className="text-[11px] text-white/40">
                          {l.category} · v
                          {l.versions.find((v) => v.isLatest)?.version || "1.0.0"}{" "}
                          · {formatListingPrice(l.commerce.priceCents)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 text-white"
                          onClick={() => props.onPreview(l.id)}
                        >
                          {pt("creator.preview")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 text-white"
                          onClick={() => {
                            setVersionListingId(l.id);
                            setVersion("");
                            setChangelog("");
                            setError(null);
                          }}
                        >
                          {pt("creator.newVersion")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {versionListingId ? (
              <div className="space-y-2 rounded-lg border border-premium-gold/25 bg-premium-gold/5 p-3">
                <p className="text-[12px] font-semibold text-premium-gold">
                  {pt("creator.addVersion")}
                </p>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder={pt("creator.versionPlaceholder")}
                  className="border-white/10 bg-white/5 text-white"
                />
                <Textarea
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder={pt("creator.changelogPlaceholder")}
                  className="min-h-[72px] border-white/10 bg-white/5 text-white"
                />
                {error ? (
                  <p className="text-[12px] text-red-400">{error}</p>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white"
                    onClick={() => setVersionListingId(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-premium-gold text-black"
                    disabled={
                      savingVersion || !version.trim() || !changelog.trim()
                    }
                    onClick={() => void addVersion()}
                  >
                    {savingVersion ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : null}
                    {pt("creator.saveVersion")}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-white/40">
            {pt("creator.loadFailed")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
