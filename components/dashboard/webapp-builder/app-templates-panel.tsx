"use client";



import { useEffect, useMemo, useState } from "react";

import {

  Building2,

  CalendarCheck,

  Car,

  GraduationCap,

  HeartPulse,

  Home,

  Landmark,

  LayoutDashboard,

  Package,

  Search,

  ShoppingCart,

  Sparkles,

  UtensilsCrossed,

  Users,

  type LucideIcon,

} from "lucide-react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useProductT } from "@/lib/i18n/use-scoped-t";



export type AppTemplateSummary = {

  id: string;

  label: string;

  description: string;

  industry: string;

  architecture: string;

  defaultFeatures: string[];

  screenCount: number;

  modelCount: number;

  roleCount: number;

  userFlows: string[];

};



type AppTemplatesPanelProps = {

  selectedId?: string;

  onSelect: (template: AppTemplateSummary) => void;

  onClear?: () => void;

};



type TemplateTranslator = (

  key: string,

  values?: Record<string, string | number>,

) => string;



const TEMPLATE_ICONS: Record<string, LucideIcon> = {

  restaurant: UtensilsCrossed,

  ecommerce: ShoppingCart,

  booking: CalendarCheck,

  crm: Users,

  erp: Building2,

  inventory: Package,

  "saas-dashboard": LayoutDashboard,

  education: GraduationCap,

  "real-estate": Home,

  automotive: Car,

  healthcare: HeartPulse,

  finance: Landmark,

};



function templateIcon(id: string): LucideIcon {

  return TEMPLATE_ICONS[id] ?? Sparkles;

}



function isMissingTranslation(result: string): boolean {

  return result.startsWith("products.");

}



export function resolveTemplateLabel(

  p: TemplateTranslator,

  template: Pick<AppTemplateSummary, "id" | "label">,

): string {

  const localized = p(`templates.catalog.${template.id}.label`);

  return isMissingTranslation(localized) ? template.label : localized;

}



export function resolveTemplateDescription(

  p: TemplateTranslator,

  template: Pick<AppTemplateSummary, "id" | "description">,

): string {

  const localized = p(`templates.catalog.${template.id}.description`);

  return isMissingTranslation(localized) ? template.description : localized;

}



export function resolveArchitectureLabel(

  p: TemplateTranslator,

  architecture: string,

): string {

  const localized = p(`templates.architectures.${architecture}`);

  return isMissingTranslation(localized) ? architecture : localized;

}



export function AppTemplatesPanel({

  selectedId,

  onSelect,

  onClear,

}: AppTemplatesPanelProps) {

  const p = useProductT("webappBuilder");

  const [templates, setTemplates] = useState<AppTemplateSummary[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    let cancelled = false;

    (async () => {

      setLoading(true);

      setError(null);

      try {

        const res = await fetch("/api/webapp-builder/design-platform");

        const data = (await res.json()) as { templates?: AppTemplateSummary[]; error?: string };

        if (!res.ok) throw new Error(data.error ?? p("templates.failedLoad"));

        if (!cancelled) setTemplates(data.templates ?? []);

      } catch (err) {

        if (!cancelled) {

          setError(err instanceof Error ? err.message : p("templates.failedLoad"));

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    })();

    return () => {

      cancelled = true;

    };

  }, [p]);



  const localizedTemplates = useMemo(

    () =>

      templates.map((template) => ({

        template,

        label: resolveTemplateLabel(p, template),

        description: resolveTemplateDescription(p, template),

        architectureLabel: resolveArchitectureLabel(p, template.architecture),

      })),

    [templates, p],

  );



  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const FLAGSHIP = new Set(["crm", "booking", "ecommerce", "healthcare", "finance"]);
    const list = !q
      ? localizedTemplates
      : localizedTemplates.filter(({ label, description, architectureLabel, template }) => (
          label.toLowerCase().includes(q) ||
          description.toLowerCase().includes(q) ||
          architectureLabel.toLowerCase().includes(q) ||
          template.defaultFeatures.some((feature) => feature.toLowerCase().includes(q))
        ));
    return [...list].sort((a, b) => {
      const af = FLAGSHIP.has(a.template.id) ? 0 : 1;
      const bf = FLAGSHIP.has(b.template.id) ? 0 : 1;
      if (af !== bf) return af - bf;
      return a.label.localeCompare(b.label);
    });
  }, [localizedTemplates, search]);



  const selected = templates.find((t) => t.id === selectedId);

  const selectedLabel = selected ? resolveTemplateLabel(p, selected) : "";



  return (

    <div className="space-y-4">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-base font-semibold text-white">{p("templates.title")}</h3>

          <p className="mt-1 text-sm text-white/50">{p("templates.subtitle")}</p>

        </div>

        {selected && onClear ? (

          <Button

            type="button"

            variant="outline"

            size="sm"

            onClick={onClear}

            className="rounded-xl border-white/15 bg-white/[0.03] text-white/70"

          >

            {p("templates.clearSelection")}

          </Button>

        ) : null}

      </div>



      {selected ? (

        <div className="rounded-xl border border-premium-gold/30 bg-premium-gold/8 px-4 py-3 text-sm text-premium-gold-light">

          {p("templates.selected", { name: selectedLabel })}

        </div>

      ) : null}



      <div className="relative">

        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />

        <Input

          value={search}

          onChange={(e) => setSearch(e.target.value)}

          placeholder={p("templates.searchPlaceholder")}

          className="rounded-xl border-white/10 bg-white/5 pl-9 text-white"

        />

      </div>



      {loading ? (

        <p className="text-sm text-white/45">{p("templates.loading")}</p>

      ) : error ? (

        <p className="text-sm text-red-400" role="alert">

          {error}

        </p>

      ) : filtered.length === 0 ? (

        <p className="text-sm text-white/45">{p("templates.empty")}</p>

      ) : (

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

          {filtered.map(({ template, label, description, architectureLabel }) => {

            const Icon = templateIcon(template.id);

            const isSelected = selectedId === template.id;

            return (

              <button

                key={template.id}

                type="button"

                onClick={() => onSelect(template)}

                className={cn(

                  "rounded-2xl border p-4 text-left transition",

                  isSelected

                    ? "border-premium-gold/50 bg-premium-gold/10 ring-1 ring-premium-gold/30"

                    : "border-white/[0.08] bg-white/[0.02] hover:border-premium-gold/30 hover:bg-white/[0.04]",

                )}

              >

                <div className="flex items-start gap-3">

                  <span

                    className={cn(

                      "flex size-11 shrink-0 items-center justify-center rounded-xl",

                      isSelected

                        ? "bg-premium-gold/20 text-premium-gold-light"

                        : "bg-white/[0.04] text-premium-gold",

                    )}

                  >

                    <Icon className="size-5" aria-hidden />

                  </span>

                  <div className="min-w-0 flex-1">

                    <p className="font-semibold text-white">{label}</p>
                    {["crm", "booking", "ecommerce", "healthcare", "finance"].includes(template.id) ? (
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-premium-gold-light uppercase">
                        {p("templates.flagshipBadge")}
                      </p>
                    ) : null}

                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-premium-gold/75">

                      {architectureLabel}

                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-white/55">

                      {description}

                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/40">

                      <span className="rounded-full border border-white/10 px-2 py-0.5">

                        {p("templates.screens", { count: template.screenCount })}

                      </span>

                      <span className="rounded-full border border-white/10 px-2 py-0.5">

                        {p("templates.models", { count: template.modelCount })}

                      </span>

                      <span className="rounded-full border border-white/10 px-2 py-0.5">

                        {p("templates.roles", { count: template.roleCount })}

                      </span>

                    </div>

                    {template.userFlows[0] ? (

                      <p className="mt-2 line-clamp-1 text-xs text-white/35">

                        {template.userFlows[0]}

                      </p>

                    ) : null}

                  </div>

                </div>

              </button>

            );

          })}

        </div>

      )}

    </div>

  );

}


