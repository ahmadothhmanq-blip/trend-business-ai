"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { IconPicker } from "@/components/dashboard/visual-editor/icon-picker";
import { LucideIconGlyph } from "@/components/dashboard/visual-editor/icon-render";
import {
  ICON_SIZE_PX,
  type IconBackgroundShape,
  type IconPosition,
  type IconPreviewState,
  type IconRotationPreset,
  type IconSize,
  type IconVariant,
  type VisualIcon,
} from "@/lib/ai-core/visual-editor/icon-types";
import { resolveIconPreviewStyle } from "@/lib/ai-core/visual-editor/icon-styles";

type IconPropertiesPanelProps = {
  icon: VisualIcon;
  disabled?: boolean;
  previewState: IconPreviewState;
  onPreviewStateChange: (state: IconPreviewState) => void;
  onChange: (patch: Partial<VisualIcon>) => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
      {children}
    </p>
  );
}

function SelectField<T extends string | number>(props: {
  value: T;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={String(props.value)}
      disabled={props.disabled}
      onChange={(e) => {
        const raw = e.target.value;
        const match = props.options.find((o) => String(o.value) === raw);
        if (match) props.onChange(match.value);
      }}
      className="h-9 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-[11px] text-white"
    >
      {props.options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

const KIND_LABELS: Record<VisualIcon["kind"], string> = {
  button: "Button",
  nav: "Navigation",
  footer: "Footer",
  feature: "Feature card",
  service: "Service card",
  contact: "Contact",
  social: "Social media",
  hero: "Hero",
  list: "List",
  cta: "CTA",
  info: "Info box",
  inline: "Inline",
};

export function IconPropertiesPanel({
  icon,
  disabled,
  previewState,
  onPreviewStateChange,
  onChange,
}: IconPropertiesPanelProps) {
  const pt = useProductT("visualEditor");
  const it = (key: string): string => pt(`iconEditor.${key}` as "iconEditor.title");
  const previewStyle = resolveIconPreviewStyle(icon, previewState);

  const patchColors = (patch: Partial<VisualIcon["colors"]>) =>
    onChange({ colors: { ...icon.colors, ...patch } });
  const patchBorder = (patch: Partial<VisualIcon["border"]>) =>
    onChange({ border: { ...icon.border, ...patch } });
  const patchSpacing = (patch: Partial<VisualIcon["spacing"]>) =>
    onChange({ spacing: { ...icon.spacing, ...patch } });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="text-[10px] uppercase tracking-wider text-white/40">{it("preview")}</p>
        <div className="mt-2 flex items-center gap-2">
          <span style={previewStyle}>
            <LucideIconGlyph
              name={icon.name}
              className={cn(
                icon.variant === "filled" && "fill-current",
                icon.variant === "duotone" && "opacity-80",
              )}
              strokeWidth={icon.variant === "filled" ? 0 : 1.75}
            />
          </span>
          <span className="text-[11px] text-white/50">
            {KIND_LABELS[icon.kind]} · {icon.name}
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {(["normal", "hover", "disabled"] as const).map((state) => (
            <button
              key={state}
              type="button"
              disabled={disabled}
              onClick={() => onPreviewStateChange(state)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                previewState === state
                  ? "border-premium-gold/50 bg-premium-gold/15 text-white"
                  : "border-white/10 text-white/50",
              )}
            >
              {it(`states.${state}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>{it("library")}</FieldLabel>
        <IconPicker
          value={icon.name}
          disabled={disabled}
          onChange={(name) => onChange({ name })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{it("position")}</FieldLabel>
          <SelectField<IconPosition>
            value={icon.position}
            disabled={disabled}
            onChange={(position) => onChange({ position })}
            options={[
              { value: "none", label: it("positionNone") },
              { value: "left", label: it("positionLeft") },
              { value: "right", label: it("positionRight") },
              { value: "top", label: it("positionTop") },
              { value: "bottom", label: it("positionBottom") },
            ]}
          />
        </div>
        <div>
          <FieldLabel>{it("variant")}</FieldLabel>
          <SelectField<IconVariant>
            value={icon.variant}
            disabled={disabled}
            onChange={(variant) => onChange({ variant })}
            options={[
              { value: "outline", label: it("variantOutline") },
              { value: "filled", label: it("variantFilled") },
              { value: "duotone", label: it("variantDuotone") },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{it("size")}</FieldLabel>
          <SelectField<IconSize>
            value={icon.size}
            disabled={disabled}
            onChange={(size) => onChange({ size })}
            options={[
              { value: "xs", label: `XS (${ICON_SIZE_PX.xs}px)` },
              { value: "sm", label: `Small (${ICON_SIZE_PX.sm}px)` },
              { value: "md", label: `Medium (${ICON_SIZE_PX.md}px)` },
              { value: "lg", label: `Large (${ICON_SIZE_PX.lg}px)` },
              { value: "xl", label: `XL (${ICON_SIZE_PX.xl}px)` },
              { value: "custom", label: it("sizeCustom") },
            ]}
          />
        </div>
        {icon.size === "custom" ? (
          <div>
            <FieldLabel>{it("customSizePx")}</FieldLabel>
            <Input
              type="number"
              min={8}
              max={96}
              value={icon.customSizePx}
              disabled={disabled}
              onChange={(e) =>
                onChange({ customSizePx: Number(e.target.value) || icon.customSizePx })
              }
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        ) : null}
      </div>

      <div>
        <FieldLabel>{it("colors")}</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={icon.colors.normal}
            disabled={disabled}
            onChange={(e) => patchColors({ normal: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("colorNormal")}
          />
          <Input
            value={icon.colors.hover}
            disabled={disabled}
            onChange={(e) => patchColors({ hover: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("colorHover")}
          />
          <Input
            value={icon.colors.disabled}
            disabled={disabled}
            onChange={(e) => patchColors({ disabled: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("colorDisabled")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{it("background")}</FieldLabel>
          <SelectField<IconBackgroundShape>
            value={icon.background}
            disabled={disabled}
            onChange={(background) => onChange({ background })}
            options={[
              { value: "none", label: it("backgroundNone") },
              { value: "circle", label: it("backgroundCircle") },
              { value: "rounded-square", label: it("backgroundRounded") },
              { value: "square", label: it("backgroundSquare") },
            ]}
          />
        </div>
        {icon.background !== "none" ? (
          <div>
            <FieldLabel>{it("backgroundColor")}</FieldLabel>
            <Input
              value={icon.backgroundColor}
              disabled={disabled}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        ) : null}
      </div>

      <div>
        <FieldLabel>{it("border")}</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={icon.border.width}
            disabled={disabled}
            onChange={(e) => patchBorder({ width: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("borderWidth")}
          />
          <Input
            value={icon.border.color}
            disabled={disabled}
            onChange={(e) => patchBorder({ color: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("borderColor")}
          />
          <Input
            value={icon.border.radius}
            disabled={disabled}
            onChange={(e) => patchBorder({ radius: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("borderRadius")}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{it("spacing")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={icon.spacing.margin}
            disabled={disabled}
            onChange={(e) => patchSpacing({ margin: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("margin")}
          />
          <Input
            value={icon.spacing.padding}
            disabled={disabled}
            onChange={(e) => patchSpacing({ padding: e.target.value })}
            className="border-white/10 bg-white/5 text-white"
            placeholder={it("padding")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>{it("rotation")}</FieldLabel>
          <SelectField<IconRotationPreset>
            value={icon.rotation}
            disabled={disabled}
            onChange={(rotation) => onChange({ rotation })}
            options={[
              { value: 0, label: "0°" },
              { value: 90, label: "90°" },
              { value: 180, label: "180°" },
              { value: 270, label: "270°" },
              { value: "custom", label: it("rotationCustom") },
            ]}
          />
        </div>
        {icon.rotation === "custom" ? (
          <div>
            <FieldLabel>{it("customRotationDeg")}</FieldLabel>
            <Input
              type="number"
              value={icon.customRotationDeg}
              disabled={disabled}
              onChange={(e) =>
                onChange({ customRotationDeg: Number(e.target.value) || 0 })
              }
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        ) : null}
      </div>

      <div>
        <FieldLabel>{it("accessibility")}</FieldLabel>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] text-white/55">
            <input
              type="checkbox"
              checked={icon.decorative}
              disabled={disabled}
              onChange={(e) => onChange({ decorative: e.target.checked })}
            />
            {it("decorative")}
          </label>
          {!icon.decorative ? (
            <Input
              value={icon.ariaLabel}
              disabled={disabled}
              onChange={(e) => onChange({ ariaLabel: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
              placeholder="aria-label"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
