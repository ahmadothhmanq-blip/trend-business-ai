"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  formatHref,
  stripHrefForEditor,
} from "@/lib/ai-core/visual-editor/link-format";
import {
  LINK_REL_OPTIONS,
  type LinkRelFlag,
  type LinkTarget,
  type VisualLink,
  type VisualLinkType,
} from "@/lib/ai-core/visual-editor/link-types";
import { validateLink } from "@/lib/ai-core/visual-editor/link-validate";

type LinkPropertiesPanelProps = {
  link: VisualLink;
  internalRoutes: Array<{ path: string; label: string }>;
  anchorSections: Array<{ id: string; label: string }>;
  disabled?: boolean;
  onChange: (patch: Partial<VisualLink>) => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
      {children}
    </p>
  );
}

function SelectField<T extends string>(props: {
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={props.value}
      disabled={props.disabled}
      onChange={(e) => props.onChange(e.target.value as T)}
      className="h-9 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
    >
      {props.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

const KIND_LABELS: Record<VisualLink["kind"], string> = {
  button: "Button",
  cta: "CTA",
  text: "Text link",
  nav: "Navigation",
  footer: "Footer link",
  image: "Image link",
  icon: "Icon link",
  logo: "Logo",
};

export function LinkPropertiesPanel({
  link,
  internalRoutes,
  anchorSections,
  disabled,
  onChange,
}: LinkPropertiesPanelProps) {
  const pt = useProductT("visualEditor");
  const lt = (key: string): string => pt(`linkEditor.${key}` as "linkEditor.title");

  const validation = validateLink(link, {
    internalRoutes: internalRoutes.map((r) => r.path),
    anchorIds: anchorSections.map((a) => a.id),
  });

  const linkEditorValue = stripHrefForEditor(link.linkType, link.href);

  const toggleRel = (flag: LinkRelFlag) => {
    const has = link.rel.includes(flag);
    onChange({
      rel: has ? link.rel.filter((r) => r !== flag) : [...link.rel, flag],
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="text-[10px] uppercase tracking-wider text-white/40">{lt("preview")}</p>
        <a
          href={formatHref(link.linkType, link.href)}
          target={link.target === "new" ? "_blank" : undefined}
          rel={link.rel.join(" ") || undefined}
          className="mt-2 inline-flex text-sm font-medium text-premium-gold-light underline"
          onClick={(e) => e.preventDefault()}
        >
          {link.label || lt("labelPlaceholder")}
        </a>
        <p className="mt-1 text-[10px] text-white/35">
          {KIND_LABELS[link.kind]} · {formatHref(link.linkType, link.href)}
        </p>
      </div>

      {validation.status !== "valid" ? (
        <div
          className={cn(
            "rounded-md border px-2 py-1.5 text-[11px]",
            validation.status === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-200",
          )}
        >
          {validation.message}
        </div>
      ) : null}

      <div>
        <FieldLabel>{lt("label")}</FieldLabel>
        <Input
          value={link.label}
          disabled={disabled || link.kind === "logo"}
          onChange={(e) => onChange({ label: e.target.value })}
          className="border-white/10 bg-white/5 text-white"
          placeholder={lt("labelPlaceholder")}
        />
      </div>

      <div>
        <FieldLabel>{lt("linkType")}</FieldLabel>
        <SelectField<VisualLinkType>
          value={link.linkType}
          disabled={disabled}
          onChange={(linkType) =>
            onChange({
              linkType,
              href: formatHref(linkType, linkEditorValue || link.href),
            })
          }
          options={[
            { value: "internal", label: lt("types.internal") },
            { value: "external", label: lt("types.external") },
            { value: "email", label: lt("types.email") },
            { value: "phone", label: lt("types.phone") },
            { value: "whatsapp", label: lt("types.whatsapp") },
            { value: "telegram", label: lt("types.telegram") },
            { value: "anchor", label: lt("types.anchor") },
            { value: "download", label: lt("types.download") },
          ]}
        />
        {link.linkType === "internal" ? (
          <SelectField
            value={
              internalRoutes.some((r) => r.path === link.href)
                ? link.href
                : link.href.startsWith("/")
                  ? link.href
                  : `/${link.href}`
            }
            disabled={disabled}
            onChange={(href) => onChange({ href })}
            options={[
              ...internalRoutes,
              ...(internalRoutes.some((r) => r.path === link.href)
                ? []
                : [{ path: link.href, label: link.href }]),
            ].map((r) => ({
              value: r.path,
              label: `${r.label} (${r.path})`,
            }))}
          />
        ) : link.linkType === "anchor" ? (
          <SelectField
            value={link.href.replace(/^#/, "")}
            disabled={disabled}
            onChange={(id) => onChange({ href: `#${id}` })}
            options={anchorSections.map((s) => ({
              value: s.id,
              label: `#${s.id} — ${s.label}`,
            }))}
          />
        ) : (
          <Input
            value={linkEditorValue}
            disabled={disabled}
            onChange={(e) =>
              onChange({ href: formatHref(link.linkType, e.target.value) })
            }
            className="mt-2 border-white/10 bg-white/5 text-white"
            placeholder={lt("hrefPlaceholder")}
          />
        )}
      </div>

      <div>
        <FieldLabel>{lt("target")}</FieldLabel>
        <SelectField<LinkTarget>
          value={link.target}
          disabled={disabled}
          onChange={(target) => onChange({ target })}
          options={[
            { value: "same", label: lt("targetSame") },
            { value: "new", label: lt("targetNew") },
          ]}
        />
      </div>

      <div>
        <FieldLabel>{lt("rel")}</FieldLabel>
        <div className="flex flex-wrap gap-1">
          {LINK_REL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleRel(opt.id)}
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-medium",
                link.rel.includes(opt.id)
                  ? "bg-premium-gold/20 text-premium-gold-light"
                  : "text-white/45 hover:text-white/70",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
